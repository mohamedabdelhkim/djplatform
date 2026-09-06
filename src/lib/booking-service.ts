import type { BookingRequest, BookingResponse } from "@/types/booking";

const BOOKING_API_ENDPOINT = "/api/booking";

/**
 * Submits a booking request to the backend endpoint.
 *
 * Encapsulates all transport knowledge: endpoint URL, HTTP method, headers,
 * request payload serialization, response parsing, and error normalization.
 *
 * Guarantees never to throw: all network failures and non-2xx HTTP responses
 * are normalized into a BookingResponse with success: false and a human-readable message.
 */
export async function submitBookingRequest(
  request: BookingRequest,
  honeypot: string = "",
  turnstileToken?: string
): Promise<BookingResponse> {
  try {
    const response = await fetch(BOOKING_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // `contact_reference` is the honeypot. It stays out of BookingRequest so the domain
      // type describes a booking, not the anti-spam mechanism; the transport
      // layer is where wire concerns belong.
      body: JSON.stringify({ ...request, contact_reference: honeypot, turnstileToken }),
    });

    let responseData: { success?: boolean; message?: string; error?: string } | null = null;
    try {
      responseData = await response.json();
    } catch {
      // Non-JSON or empty response
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        `Server returned status ${response.status} (${response.statusText || "Request failed"}).`;

      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: responseData?.success ?? true,
      message: responseData?.message || "Booking inquiry transmitted successfully.",
    };
  } catch (error) {
    const networkMessage =
      error instanceof Error
        ? error.message
        : "Network communication error connecting to the booking service.";

    return {
      success: false,
      message: `Unable to submit booking inquiry: ${networkMessage}`,
    };
  }
}
