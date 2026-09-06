interface Env {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
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
      data = JSON.parse(rawBody) as BookingPayload;
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
