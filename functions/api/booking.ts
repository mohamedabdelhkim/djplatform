import { findConfigProblem } from "../../src/lib/booking-config";

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  /** KV namespace used only as a short-lived per-IP counter. Optional: when the
   *  binding is absent the endpoint still works, unthrottled. */
  BOOKING_RATE_LIMIT?: KVNamespace;
  BOOKING_NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_DEMO_MODE?: string;
}

interface BookingPayload {
  name?: string;
  email?: string;
  organization?: string;
  eventName?: string;
  eventDate?: string;
  location?: string;
  budget?: string;
  message?: string;
  websiteUrl?: string;
  /** Turnstile token produced by the widget on the page. */
  turnstileToken?: string;
  /** Honeypot. Hidden from users; only automated submissions fill it.
   *  Deliberately NOT named company/organization/fax: those are autofill
   *  tokens, and a browser filling this for a real person would discard a
   *  genuine booking while showing them a success message. */
  contact_reference?: string;
}

/**
 * Hard limits, enforced before anything is dispatched.
 *
 * The endpoint is public and unauthenticated, so an unbounded body is both a
 * cost and an abuse vector: a 4.8 MB payload was accepted and parsed before
 * these were added.
 */
const MAX_BODY_BYTES = 64 * 1024;

const MAX_FIELD_LENGTH: Record<keyof BookingPayload, number> = {
  name: 120,
  email: 254,
  organization: 160,
  eventName: 200,
  eventDate: 32,
  location: 200,
  budget: 32,
  message: 5000,
  websiteUrl: 500,
  contact_reference: 100,
  turnstileToken: 2048,
};

/** Strips CR/LF and control characters, then truncates. Used for the subject,
 *  which is assembled from user-supplied values. */
function sanitizeHeaderValue(value: string, max = 160): string {
  return value
    .replace(/[\r\n\t]+/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

/** Requests allowed per IP inside RATE_WINDOW_SECONDS. */
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600;

/**
 * Best-effort per-IP throttle backed by Workers KV.
 *
 * Fails OPEN, unlike every other check in this file. A throttle is a mitigation,
 * not a security boundary: if the counter store is unavailable, refusing every
 * booking would turn a storage blip into an outage, and the honeypot, size cap,
 * length limits and validation all still apply. Turnstile failed closed because
 * it answers "is this a person" - a question you cannot skip.
 *
 * KV has no atomic increment and is eventually consistent, so a burst arriving
 * at once can slip a couple of requests past the limit. That is acceptable here:
 * the goal is to stop sustained automated abuse, not to enforce an exact quota.
 *
 * Once an IP is over the limit no further writes happen - only a read - so a
 * flood cannot burn through the daily KV write allowance.
 */
async function withinRateLimit(
  store: KVNamespace | undefined,
  ip: string | null
): Promise<boolean> {
  if (!store || !ip) return true;

  const key = `rl:${ip}`;
  try {
    const used = Number(await store.get(key)) || 0;
    if (used >= RATE_LIMIT) return false;
    await store.put(key, String(used + 1), { expirationTtl: RATE_WINDOW_SECONDS });
    return true;
  } catch (error) {
    console.error("Rate limit store unavailable, allowing request:", error);
    return true;
  }
}

/**
 * Verifies a Turnstile token with Cloudflare.
 *
 * Fails closed: a missing secret, a missing token or a rejected token all
 * refuse the submission. Turnstile answers "is this a person", which cannot be
 * skipped — unlike the throttle, which fails open because it is a mitigation.
 *
 * Checks `action` and `hostname` as well as `success`, per Cloudflare's own
 * guidance: without them a token minted for any other widget on the account
 * would be accepted here.
 */
async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  remoteIp: string | null,
  expectedHostname: string
): Promise<boolean> {
  if (!token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const outcome = (await res.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };

    if (outcome.success !== true) {
      console.error("Turnstile rejected a token:", JSON.stringify(outcome["error-codes"] ?? []));
      return false;
    }
    if (outcome.action && outcome.action !== "booking") {
      console.error("Turnstile token was minted for a different action:", outcome.action);
      return false;
    }
    if (outcome.hostname && outcome.hostname !== expectedHostname) {
      console.error("Turnstile token came from another hostname:", outcome.hostname);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Turnstile verification request failed:", error);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Runs before request parsing on purpose. A misconfigured endpoint is broken
    // for everyone, so it should not look like a client error - and putting it
    // first means the uptime monitor's probe sees it too, which turns a silent
    // configuration mistake into an alert within fifteen minutes.
    const configProblem = findConfigProblem(context.env);
    if (configProblem && context.env.BOOKING_DEMO_MODE !== "true") {
      console.error(
        `Booking service misconfigured: ${configProblem.variable} ${configProblem.reason}.`
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: `Booking service is misconfigured: ${configProblem.variable} ${configProblem.reason}.`,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const contentType = context.request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Invalid Content-Type. Expected application/json." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const declaredLength = Number(context.request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({ error: "Request body is too large." }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const rawBody = await context.request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({ error: "Request body is too large." }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let data: BookingPayload;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      // `null`, `true`, `42` and `[]` are all valid JSON but not a booking.
      // Without this guard `null` reached the field checks and threw, turning a
      // malformed request into a 500 that looks like a server fault.
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return new Response(
          JSON.stringify({ error: "Request body must be a JSON object." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      data = parsed as BookingPayload;
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed JSON body." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Honeypot: `company` is hidden from real users. A filled value means an
    // automated submission. Accept it so the bot sees success and does not
    // retry, but dispatch nothing.
    if (typeof data.contact_reference === "string" && data.contact_reference.trim() !== "") {
      return new Response(
        JSON.stringify({ success: true, message: "Booking inquiry received." }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Placed after the honeypot so submissions the honeypot already catches
    // cost no KV write, and before Resend so abuse never reaches the paid path.
    const clientIp = context.request.headers.get("cf-connecting-ip");
    if (!(await withinRateLimit(context.env.BOOKING_RATE_LIMIT, clientIp))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many booking requests from this address. Please try again in a few minutes.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(RATE_WINDOW_SECONDS),
          },
        }
      );
    }

    // After the honeypot and the throttle, before Resend: a bot caught earlier
    // costs no siteverify round-trip, and abuse never reaches the paid path.
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      // Logged rather than refused. Turnstile is the newest layer and the one
      // whose absence must not repeat 6 September, when enforcing an unverified
      // dependency took bookings down for forty minutes. The honeypot, throttle,
      // size cap and length limits all still apply.
      console.warn("TURNSTILE_SECRET_KEY is not set - human verification is skipped.");
    } else {
      const verified = await verifyTurnstile(
        data.turnstileToken,
        turnstileSecret,
        context.request.headers.get("cf-connecting-ip"),
        new URL(context.request.url).hostname
      );
      if (!verified) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Verification failed. Please reload the page and try again.",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    for (const [field, limit] of Object.entries(MAX_FIELD_LENGTH)) {
      const value = data[field as keyof BookingPayload];
      if (typeof value === "string" && value.length > limit) {
        return new Response(
          JSON.stringify({ error: `Field "${field}" exceeds the maximum length of ${limit} characters.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, and message are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address format." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recipientEmail = context.env.BOOKING_NOTIFICATION_EMAIL || "booking@example.com";
    const resendApiKey = context.env.RESEND_API_KEY;
    const fromSender = context.env.BOOKING_FROM_EMAIL || "DJ Platform Booking <onboarding@resend.dev>";

    // Forward to Resend if API key is configured
    if (resendApiKey) {
      const emailContent = `
New Booking Inquiry Received:

Name: ${data.name}
Email: ${data.email}
Organization: ${data.organization || "N/A"}
Event: ${data.eventName || "N/A"}
Date: ${data.eventDate || "N/A"}
Location: ${data.location || "N/A"}
Budget: ${data.budget || "N/A"}
Website: ${data.websiteUrl || "N/A"}

Message:
${data.message}
      `.trim();

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromSender,
          to: [recipientEmail],
          reply_to: data.email,
          subject: sanitizeHeaderValue(
            `[Booking Inquiry] ${data.eventName || "New Request"} - ${data.name}`
          ),
          text: emailContent,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error("Resend API error:", errorText);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to dispatch notification email via Resend.",
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Booking inquiry transmitted successfully.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // No RESEND_API_KEY configured
    if (context.env.BOOKING_DEMO_MODE === "true") {
      console.log("[DEMO MODE] Booking inquiry processed without Resend API key:", {
        recipientEmail,
        fromSender,
        data,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "[DEMO MODE] Booking inquiry recorded locally. No email dispatched.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Booking service error: RESEND_API_KEY is not configured.");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Booking service is not configured. RESEND_API_KEY environment variable is missing.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Booking handler error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error processing booking request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
