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
    assert.deepEqual(JSON.parse(calls[0].init.body as string), REQUEST);
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
});
