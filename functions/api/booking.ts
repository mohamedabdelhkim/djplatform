interface Env {
  BOOKING_NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
}

interface BookingPayload {
  name?: string;
  email?: string;
  message?: string;
  organization?: string;
  eventName?: string;
  eventDate?: string;
  location?: string;
  budget?: string;
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
          from: "DJ Platform Booking <onboarding@resend.dev>",
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
          JSON.stringify({ error: "Failed to dispatch notification email via Resend." }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Demo / Development mode (no API key configured)
      console.log("[DEMO MODE] Booking inquiry processed without Resend API key:", {
        recipientEmail,
        data,
      });
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
  } catch (error) {
    console.error("Booking handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error processing booking request." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
