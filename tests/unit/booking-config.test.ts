import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { findConfigProblem } from "@/lib/booking-config";

// The check lives in src/lib rather than inside the Function so it carries no
// Workers types and can be tested here. The Function imports it; this is the
// same split already used for booking-validation.

const VALID = {
  RESEND_API_KEY: "re_abc123456789",
  BOOKING_NOTIFICATION_EMAIL: "promoter@example.com",
};

describe("findConfigProblem()", () => {
  test("a correct configuration reports no problem", () => {
    assert.equal(findConfigProblem(VALID), null);
  });

  describe("RESEND_API_KEY", () => {
    test("missing is reported", () => {
      const p = findConfigProblem({ ...VALID, RESEND_API_KEY: undefined });
      assert.equal(p?.variable, "RESEND_API_KEY");
      assert.match(p!.reason, /not set/);
    });

    test("blank is reported", () => {
      assert.equal(findConfigProblem({ ...VALID, RESEND_API_KEY: "   " })?.variable, "RESEND_API_KEY");
    });

    test("a value that is not a Resend key is reported", () => {
      const p = findConfigProblem({ ...VALID, RESEND_API_KEY: "promoter@example.com" });
      assert.equal(p?.variable, "RESEND_API_KEY");
      assert.match(p!.reason, /re_/);
    });
  });

  describe("BOOKING_NOTIFICATION_EMAIL", () => {
    test("missing is reported", () => {
      assert.equal(
        findConfigProblem({ ...VALID, BOOKING_NOTIFICATION_EMAIL: undefined })?.variable,
        "BOOKING_NOTIFICATION_EMAIL"
      );
    });

    // The actual 6 September outage: the Resend key was pasted into both
    // secrets, and the only symptom was an opaque 502 from Resend.
    test("holding a Resend key is named as a swap, not just an invalid address", () => {
      const p = findConfigProblem({
        ...VALID,
        BOOKING_NOTIFICATION_EMAIL: "re_abc123456789",
      });
      assert.equal(p?.variable, "BOOKING_NOTIFICATION_EMAIL");
      assert.match(p!.reason, /swapped/);
    });

    for (const bad of ["not-an-email", "missing@domain", "@example.com", "two@@x.com", "a b@example.com"]) {
      test(`rejects ${JSON.stringify(bad)}`, () => {
        assert.equal(
          findConfigProblem({ ...VALID, BOOKING_NOTIFICATION_EMAIL: bad })?.variable,
          "BOOKING_NOTIFICATION_EMAIL"
        );
      });
    }

    test("accepts a display-name address", () => {
      assert.equal(
        findConfigProblem({ ...VALID, BOOKING_NOTIFICATION_EMAIL: "Bookings <a@b.co>" }),
        null
      );
    });
  });

  describe("BOOKING_FROM_EMAIL", () => {
    test("unset is fine — the sandbox sender is the documented fallback", () => {
      assert.equal(findConfigProblem({ ...VALID, BOOKING_FROM_EMAIL: undefined }), null);
    });

    test("a plain address is accepted", () => {
      assert.equal(findConfigProblem({ ...VALID, BOOKING_FROM_EMAIL: "a@b.co" }), null);
    });

    test("a display-name address is accepted", () => {
      assert.equal(findConfigProblem({ ...VALID, BOOKING_FROM_EMAIL: "DJ <a@b.co>" }), null);
    });

    test("a malformed value is reported", () => {
      assert.equal(
        findConfigProblem({ ...VALID, BOOKING_FROM_EMAIL: "not an address" })?.variable,
        "BOOKING_FROM_EMAIL"
      );
    });
  });

  test("the first problem found is the one reported", () => {
    const p = findConfigProblem({ RESEND_API_KEY: undefined, BOOKING_NOTIFICATION_EMAIL: "also-bad" });
    assert.equal(p?.variable, "RESEND_API_KEY");
  });
});
