import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { submitBookingRequest } from "@/lib/booking-service";
import type { BookingRequest } from "@/types/booking";

const REQUEST: BookingRequest = {
  name: "Alex Promoter",
  email: "alex@example.com",
  organization: "Demo Collective",
  eventName: "Warehouse Session 04",
  eventDate: "2027-03-14",
  location: "Berlin, DE",
  budget: "2500-5000",
  message: "Two hour closing set.",
  websiteUrl: "https://example.com",
};

let calls: Array<{ url: string; init: RequestInit }> = [];
const realFetch = globalThis.fetch;

function stubFetch(handler: () => unknown) {
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const result = handler();
    if (result instanceof Error) throw result;
    return result;
  }) as typeof globalThis.fetch;
}

function jsonResponse(status: number, body: unknown, ok = status < 400) {
  return {
    ok,
    status,
    statusText: "",
    json: async () => body,
  };
}

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("submitBookingRequest()", () => {
  test("posts JSON to the booking endpoint", async () => {
    stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
    await submitBookingRequest(REQUEST);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/api/booking");
    assert.equal(calls[0].init.method, "POST");
    assert.equal(
      (calls[0].init.headers as Record<string, string>)["Content-Type"],
      "application/json"
    );
    // The wire payload is the booking plus the honeypot field.
    assert.deepEqual(JSON.parse(calls[0].init.body as string), { ...REQUEST, contact_reference: "" });
  });

  test("passes a successful response through", async () => {
    stubFetch(() => jsonResponse(200, { success: true, message: "Transmitted." }));
    assert.deepEqual(await submitBookingRequest(REQUEST), {
      success: true,
      message: "Transmitted.",
    });
  });

  test("reports failure when the server returns success: false on a 200", async () => {
    stubFetch(() => jsonResponse(200, { success: false, message: "Nope." }));
    const result = await submitBookingRequest(REQUEST);
    assert.equal(result.success, false);
  });

  test("surfaces the server error message on a 400", async () => {
    stubFetch(() =>
      jsonResponse(400, { error: "Missing required fields: name, email, and message are required." })
    );
    const result = await submitBookingRequest(REQUEST);
    assert.equal(result.success, false);
    assert.match(result.message, /Missing required fields/);
  });

  // The Function returns 503 when RESEND_API_KEY is absent. That must reach the
  // user as a failure: reporting success for an email that was never dispatched
  // is the exact bug this endpoint used to have.
  test("treats a 503 as a failure, never a success", async () => {
    stubFetch(() =>
      jsonResponse(503, { success: false, error: "Booking service is not configured." })
    );
    const result = await submitBookingRequest(REQUEST);
    assert.equal(result.success, false);
    assert.match(result.message, /not configured/);
  });

  test("handles a non-JSON error body without throwing", async () => {
    stubFetch(() => ({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    }));
    const result = await submitBookingRequest(REQUEST);
    assert.equal(result.success, false);
    assert.match(result.message, /502/);
  });

  test("never throws on a network failure", async () => {
    stubFetch(() => new TypeError("Failed to fetch"));
    const result = await submitBookingRequest(REQUEST);
    assert.equal(result.success, false);
    assert.ok(result.message.length > 0);
  });

  test("always resolves to a BookingResponse shape", async () => {
    const cases = [
      () => jsonResponse(200, { success: true, message: "ok" }),
      () => jsonResponse(400, { error: "bad" }),
      () => jsonResponse(500, {}),
      () => new TypeError("offline"),
    ];
    for (const handler of cases) {
      stubFetch(handler);
      const result = await submitBookingRequest(REQUEST);
      assert.equal(typeof result.success, "boolean");
      assert.equal(typeof result.message, "string");
    }
  });

  describe("honeypot", () => {
    test("sends an empty honeypot field by default", async () => {
      stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
      await submitBookingRequest(REQUEST);
      const body = JSON.parse(calls[0].init.body as string);
      assert.equal(body.contact_reference, "");
    });

    test("forwards a filled honeypot so the server can drop the submission", async () => {
      stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
      await submitBookingRequest(REQUEST, "acme corp");
      const body = JSON.parse(calls[0].init.body as string);
      assert.equal(body.contact_reference, "acme corp");
    });

    test("the honeypot stays out of BookingRequest", async () => {
      stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
      await submitBookingRequest(REQUEST, "bot");
      const body = JSON.parse(calls[0].init.body as string);
      for (const key of Object.keys(REQUEST)) {
        assert.deepEqual(body[key], REQUEST[key as keyof typeof REQUEST]);
      }
    });
  });

  describe("Turnstile token", () => {
    test("forwards the token when the widget produced one", async () => {
      stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
      await submitBookingRequest(REQUEST, "", "tok_abc123");
      assert.equal(JSON.parse(calls[0].init.body as string).turnstileToken, "tok_abc123");
    });

    // The server fails closed on a missing token, so the absence has to reach
    // it rather than being quietly filled in with something.
    test("omits the token when the widget produced none", async () => {
      stubFetch(() => jsonResponse(200, { success: true, message: "ok" }));
      await submitBookingRequest(REQUEST);
      const body = JSON.parse(calls[0].init.body as string);
      assert.equal(body.turnstileToken, undefined);
    });

    test("surfaces the server's verification failure to the caller", async () => {
      stubFetch(() =>
        jsonResponse(403, { success: false, error: "Verification failed. Please reload the page and try again." })
      );
      const result = await submitBookingRequest(REQUEST, "", "stale-token");
      assert.equal(result.success, false);
      assert.match(result.message, /Verification failed/);
    });
  });
});
