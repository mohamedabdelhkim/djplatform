interface Env {
  BOOKING_NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
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
  /** Cloudflare Turnstile token, produced by the widget on the page. */
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

/**
 * Verifies a Turnstile token with Cloudflare.
 *
 * Fails closed: a missing secret, a missing token or a rejected token all
 * return false. The alternative - accepting when verification cannot run -
 * would make the control decorative, which is the failure mode this endpoint
 * has already had once with Resend.
 */
async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  remoteIp: string | null
): Promise<boolean> {
  if (!secret || !token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch (error) {
    console.error("Turnstile verification request failed:", error);
    return false;
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

    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      console.error("Booking service error: TURNSTILE_SECRET_KEY is not configured.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Booking service is not configured. TURNSTILE_SECRET_KEY environment variable is missing.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const humanVerified = await verifyTurnstile(
      data.turnstileToken,
      turnstileSecret,
      context.request.headers.get("cf-connecting-ip")
    );
    if (!humanVerified) {
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
