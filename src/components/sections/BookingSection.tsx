"use client";

import { useState } from "react";
import { Container } from "../layout/Container";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Toast } from "../ui/Toast";

export function BookingSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" }); // reset form
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      setStatus("error");
    }
  };

  return (
    <section id="booking" className="py-20 border-b border-border bg-surface text-text-primary">
      <Container>
        <div className="border-b border-border pb-6 mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            [05] // DIRECT INQUIRIES
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
            Booking & Contact
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <Input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Textarea
            name="message"
            placeholder="Message or Booking Details"
            value={form.message}
            onChange={handleChange}
            rows={4}
            required
          />
          <Button type="submit" variant="primary">
            Send Request
          </Button>
        </form>

        {status === "success" && (
          <Toast
            message="Booking request sent successfully!"
            type="success"
            onClose={() => setStatus("idle")}
          />
        )}
        {status === "error" && (
          <Toast
            message="Booking request failed!"
            type="error"
            onClose={() => setStatus("idle")}
          />
        )}
      </Container>
    </section>
  );
}
