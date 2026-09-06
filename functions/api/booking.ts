interface Env {
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

    const data = (await context.request.json()) as BookingPayload;

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
          subject: `[Booking Inquiry] ${data.eventName || "New Request"} - ${data.name}`,
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
