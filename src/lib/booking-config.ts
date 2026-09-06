/**
 * Checks the shape of the configuration before any request is processed.
 *
 * On 6 September BOOKING_NOTIFICATION_EMAIL held a Resend API key instead of an
 * address. Everything downstream behaved: the Function ran, Resend authenticated,
 * and only Resend's own field validation caught it, as an opaque 502 that named
 * nothing. Every booking failed for hours and the message never said which
 * variable was wrong.
 *
 * These checks are deliberately about SHAPE, not correctness. Nothing here can
 * tell whether the address is the right mailbox - only that it is an address at
 * all, which is what was actually broken.
 */
/** Only the variables this check reads — keeps the pure logic free of any
 *  Workers types so it can be imported by the Node test runner. */
export interface BookingEnvConfig {
  readonly RESEND_API_KEY?: string;
  readonly BOOKING_NOTIFICATION_EMAIL?: string;
  readonly BOOKING_FROM_EMAIL?: string;
}

export interface ConfigProblem {
  readonly variable: string;
  readonly reason: string;
}

const CONFIG_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts "a@b.com" and "Name <a@b.com>", the two forms Resend takes. */
function extractAddress(value: string): string {
  const angled = /<([^>]+)>\s*$/.exec(value.trim());
  return (angled ? angled[1] : value).trim();
}

export function findConfigProblem(env: BookingEnvConfig): ConfigProblem | null {
  const key = env.RESEND_API_KEY;
  if (!key || key.trim() === "") {
    return { variable: "RESEND_API_KEY", reason: "is not set" };
  }
  if (!key.startsWith("re_")) {
    return {
      variable: "RESEND_API_KEY",
      reason: "does not look like a Resend key — those start with 're_'",
    };
  }

  const recipient = env.BOOKING_NOTIFICATION_EMAIL;
  if (!recipient || recipient.trim() === "") {
    return { variable: "BOOKING_NOTIFICATION_EMAIL", reason: "is not set" };
  }
  if (recipient.startsWith("re_")) {
    // The exact mix-up that took bookings down. Named explicitly so nobody has
    // to work it out from a validation error again.
    return {
      variable: "BOOKING_NOTIFICATION_EMAIL",
      reason: "holds a Resend API key, not an email address — the two secrets are swapped",
    };
  }
  if (!CONFIG_EMAIL_PATTERN.test(extractAddress(recipient))) {
    return { variable: "BOOKING_NOTIFICATION_EMAIL", reason: "is not a valid email address" };
  }

  const from = env.BOOKING_FROM_EMAIL;
  if (from && from.trim() !== "" && !CONFIG_EMAIL_PATTERN.test(extractAddress(from))) {
    return {
      variable: "BOOKING_FROM_EMAIL",
      reason: "must be an address or \"Name <address>\"",
    };
  }

  return null;
}
