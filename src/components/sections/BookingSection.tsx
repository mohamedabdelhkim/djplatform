"use client";

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { submitBookingRequest } from "@/lib/booking-service";
import { cn } from "@/lib/utils";
import type { BookingRequest, BookingSubmissionStatus } from "@/types/booking";

const BUDGET_OPTIONS = [
  { value: "", label: "Select Budget Tier (USD)" },
  { value: "<1000", label: "Under $1,000" },
  { value: "1000-2500", label: "$1,000 – $2,500" },
  { value: "2500-5000", label: "$2,500 – $5,000" },
  { value: "5000-10000", label: "$5,000 – $10,000" },
  { value: "10000+", label: "$10,000+" },
] as const;

const INITIAL_FORM: BookingRequest = {
  name: "",
  email: "",
  organization: "",
  eventName: "",
  eventDate: "",
  location: "",
  budget: "",
  message: "",
  websiteUrl: "",
};

interface FormErrors {
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: BookingRequest): FormErrors {
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

  return errors;
}

export function BookingSection() {
  const [form, setForm] = useState<BookingRequest>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<BookingSubmissionStatus>("idle");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear inline error when field is modified
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setResponseMessage("");

    const response = await submitBookingRequest(form);

    if (response.success) {
      setStatus("success");
      setResponseMessage(response.message);
      setForm(INITIAL_FORM);
    } else {
      setStatus("error");
      setResponseMessage(response.message);
    }
  };

  return (
    <section id="booking" className="py-20 border-b border-border bg-surface text-text-primary">
      <Container>
        <SectionHeader
          index="05"
          label="DIRECT INQUIRIES"
          title="Booking & Contact"
          className="mb-8"
        />

        <div className="max-w-2xl space-y-6">
          <p className="font-body text-sm text-text-muted leading-relaxed">
            For festival bookings, club dates, and guest appearances. Please provide comprehensive event details below.
          </p>

          {/* Always-mounted live region. It must exist in the DOM before the
              message arrives, otherwise screen readers are not observing it
              when the text is inserted and the announcement is missed. Only
              its contents are conditional. Visually hidden, so it has no
              layout effect; the visible banner below is the sighted
              equivalent. */}
          <div role="status" aria-live="polite" className="sr-only">
            {status === "success" || status === "error" ? responseMessage : ""}
          </div>

          {/* Visible submission status banner (focus target, not the announcer) */}
          {status !== "idle" && status !== "submitting" && (
            <div
              ref={statusRef}
              tabIndex={-1}
              className={cn(
                "p-4 border font-mono text-xs transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                status === "success"
                  ? "bg-surface-active border-accent text-text-primary"
                  : "bg-surface-active border-signal text-signal"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    {status === "success" ? "[TRANSMISSION SUCCESSFUL]" : "[TRANSMISSION FAILED]"}
                  </span>
                  <p className="font-body text-sm text-text-primary">
                    {responseMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="font-mono text-xs uppercase underline text-text-muted hover:text-text-primary focus-visible:outline-accent"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="booking-name"
                name="name"
                label="Your Name"
                placeholder="Full Name / Representative"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
                disabled={status === "submitting"}
              />

              <Input
                id="booking-email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="promoter@domain.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
                disabled={status === "submitting"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="booking-organization"
                name="organization"
                label="Organization"
                placeholder="Club / Collective / Agency"
                value={form.organization}
                onChange={handleChange}
                error={errors.organization}
                required
                disabled={status === "submitting"}
              />

              <Input
                id="booking-website"
                name="websiteUrl"
                type="url"
                label="Website / Social"
                placeholder="https://event-or-club.com (Optional)"
                value={form.websiteUrl || ""}
                onChange={handleChange}
                error={errors.websiteUrl}
                disabled={status === "submitting"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="booking-event-name"
                name="eventName"
                label="Event Name"
                placeholder="Festival / Club Night Title"
                value={form.eventName}
                onChange={handleChange}
                error={errors.eventName}
                required
                disabled={status === "submitting"}
              />

              <Input
                id="booking-event-date"
                name="eventDate"
                type="date"
                label="Event Date"
                value={form.eventDate}
                onChange={handleChange}
                error={errors.eventDate}
                required
                disabled={status === "submitting"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="booking-location"
                name="location"
                label="Location"
                placeholder="City, Country / Venue Name"
                value={form.location}
                onChange={handleChange}
                error={errors.location}
                required
                disabled={status === "submitting"}
              />

              <Select
                id="booking-budget"
                name="budget"
                label="Budget Range"
                options={BUDGET_OPTIONS}
                value={form.budget}
                onChange={handleChange}
                error={errors.budget}
                required
                disabled={status === "submitting"}
              />
            </div>

            <Textarea
              id="booking-message"
              name="message"
              label="Inquiry & Technical Details"
              placeholder="Set duration, expected capacity, sound system specs, or additional context..."
              value={form.message}
              onChange={handleChange}
              error={errors.message}
              rows={5}
              required
              disabled={status === "submitting"}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={status === "submitting"}
                className="w-full sm:w-auto min-w-[200px]"
              >
                {status === "submitting" ? "Transmitting..." : "Send Booking Request"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
