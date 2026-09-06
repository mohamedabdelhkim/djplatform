import type { BookingRequest } from "@/types/booking";

/**
 * Client-side booking validation.
 *
 * Extracted from BookingSection so the rules can be unit tested directly:
 * the component is .tsx and cannot be loaded by the Node test runner.
 * These checks mirror the server-side validation in functions/api/booking.ts.
 */

export interface FormErrors {
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

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors MAX_FIELD_LENGTH in functions/api/booking.ts, so oversized input is
 * reported inline instead of coming back as a generic server rejection. The
 * server enforces the same limits regardless - this is UX, not the control.
 */
export const MAX_FIELD_LENGTH = {
  name: 120,
  email: 254,
  organization: 160,
  eventName: 200,
  eventDate: 32,
  location: 200,
  budget: 32,
  message: 5000,
  websiteUrl: 500,
} as const;

export function validate(form: BookingRequest): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name or promoter contact is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.organization.trim()) {
    errors.organization = "Organization or promoter entity is required.";
  }

  if (!form.eventName.trim()) {
    errors.eventName = "Event or festival name is required.";
  }

  if (!form.eventDate.trim()) {
    errors.eventDate = "Proposed event date is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Event location (city, country, venue) is required.";
  }

  if (!form.budget || !form.budget.trim()) {
    errors.budget = "Please select a budget tier.";
  }

  if (!form.message.trim()) {
    errors.message = "Booking inquiry details are required.";
  }

  for (const [field, limit] of Object.entries(MAX_FIELD_LENGTH)) {
    const key = field as keyof typeof MAX_FIELD_LENGTH;
    const value = form[key];
    if (typeof value === "string" && value.length > limit) {
      errors[key] = `Please keep this under ${limit} characters.`;
    }
  }

  return errors;
}
