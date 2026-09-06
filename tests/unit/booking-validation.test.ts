import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validate, MAX_FIELD_LENGTH } from "@/lib/booking-validation";
import type { BookingRequest } from "@/types/booking";

const VALID: BookingRequest = {
  name: "Alex Promoter",
  email: "alex@example.com",
  organization: "Demo Collective",
  eventName: "Warehouse Session 04",
  eventDate: "2027-03-14",
  location: "Berlin, DE",
  budget: "2500-5000",
  message: "Two hour closing set, 500 capacity.",
  websiteUrl: "",
};

describe("validate()", () => {
  test("a complete request produces no errors", () => {
    assert.deepEqual(validate(VALID), {});
  });

  test("websiteUrl is optional", () => {
    assert.equal(validate({ ...VALID, websiteUrl: "" }).websiteUrl, undefined);
    assert.equal(
      validate({ ...VALID, websiteUrl: "https://example.com" }).websiteUrl,
      undefined
    );
  });

  const REQUIRED = [
    "name",
    "email",
    "organization",
    "eventName",
    "eventDate",
    "location",
    "budget",
    "message",
  ] as const;

  for (const field of REQUIRED) {
    test(`${field} is required`, () => {
      const errors = validate({ ...VALID, [field]: "" });
      assert.ok(errors[field], `expected an error for empty ${field}`);
    });

    test(`${field} rejects whitespace-only input`, () => {
      const errors = validate({ ...VALID, [field]: "   " });
      assert.ok(errors[field], `expected an error for whitespace-only ${field}`);
    });
  }

  test("every required field reports independently", () => {
    const errors = validate({
      ...VALID,
      name: "",
      email: "",
      organization: "",
      eventName: "",
      eventDate: "",
      location: "",
      budget: "",
      message: "",
    });
    for (const field of REQUIRED) {
      assert.ok(errors[field], `missing error for ${field}`);
    }
  });

  describe("email format", () => {
    const INVALID = [
      "plainstring",
      "no-at-sign.com",
      "missing@domain",
      "spaces in@example.com",
      "two@@example.com",
      "@example.com",
      "trailing@example.com ".replace("example.com ", "example com"),
    ];

    for (const email of INVALID) {
      test(`rejects ${JSON.stringify(email)}`, () => {
        assert.ok(validate({ ...VALID, email }).email);
      });
    }

    test("accepts a plus-addressed mailbox", () => {
      assert.equal(validate({ ...VALID, email: "a+b@example.co.uk" }).email, undefined);
    });

    test("trims before validating", () => {
      assert.equal(validate({ ...VALID, email: "  alex@example.com  " }).email, undefined);
    });
  });

  // The Pages Function rejects requests missing name, email or message.
  // If the client ever stops enforcing those, users get a server round-trip
  // and a generic error instead of an inline, accessible message.
  test("enforces at least what functions/api/booking.ts enforces", () => {
    for (const field of ["name", "email", "message"] as const) {
      assert.ok(
        validate({ ...VALID, [field]: "" })[field],
        `client must reject empty ${field}, the server does`
      );
    }
    assert.ok(validate({ ...VALID, email: "not-an-email" }).email);
  });

  describe("length limits", () => {
    // These mirror the server's limits. The server is the control; this is so
    // an over-long field is reported inline instead of as a generic rejection.
    for (const [field, limit] of Object.entries(MAX_FIELD_LENGTH)) {
      const key = field as keyof typeof MAX_FIELD_LENGTH;

      test(`${field} accepts input at exactly ${limit} characters`, () => {
        const value = key === "email" ? "a".repeat(limit - 12) + "@example.com" : "x".repeat(limit);
        assert.equal(validate({ ...VALID, [key]: value })[key], undefined);
      });

      test(`${field} rejects input one character over ${limit}`, () => {
        const errors = validate({ ...VALID, [key]: "x".repeat(limit + 1) });
        assert.ok(errors[key], `expected a length error for ${field}`);
      });
    }

    test("a multi-megabyte message is rejected", () => {
      assert.ok(validate({ ...VALID, message: "x".repeat(5_000_000) }).message);
    });
  });
});
