"use client";

import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api/client";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  orderNumber: string;
  message: string;
  contactMethod: "email" | "whatsapp" | "phone";
  consent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email address";
  if (!data.phone.trim()) errors.phone = "Phone number is required";
  if (!data.country.trim()) errors.country = "Country / region is required";
  if (!data.subject.trim()) errors.subject = "Subject is required";
  if (!data.message.trim()) errors.message = "Message is required";
  if (!data.consent) errors.consent = "You must agree to be contacted";
  return errors;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", phone: "", country: "", subject: "",
    orderNumber: "", message: "", contactMethod: "email", consent: false, website: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitted && errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      setStatus("success");
      setFormData({ fullName: "", email: "", phone: "", country: "", subject: "", orderNumber: "", message: "", contactMethod: "email", consent: false, website: "" });
      setSubmitted(false);
    } catch {
      setStatus("error");
    }
  }

  function fieldClass(name: keyof FormData) {
    return `w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/30 ${
      submitted && errors[name] ? "border-destructive/60 focus:ring-destructive/30" : "border-border focus:border-primary/40"
    }`;
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10 border border-success/20">
          <svg className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Message Sent</h3>
        <p className="text-muted-foreground max-w-md">Thank you for reaching out. Our team will review your message and respond within 1-2 business days.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-primary hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <fieldset className="border border-border rounded-2xl p-6 md:p-8 space-y-5">
        <legend className="px-2 font-heading text-lg font-bold text-foreground">Contact Us</legend>

        <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden" tabIndex={-1}>
          <label htmlFor="cf-website">Leave this empty</label>
          <input id="cf-website" type="text" name="website" autoComplete="off" tabIndex={-1} value={formData.website} onChange={(e) => update("website", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cf-name" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Full Name <span className="text-primary">*</span></label>
            <input id="cf-name" type="text" autoComplete="name" required placeholder="John Doe" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)} className={fieldClass("fullName")} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "err-name" : undefined} />
            {errors.fullName && <p id="err-name" className="mt-1 text-xs text-destructive" role="alert">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="cf-email" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Email Address <span className="text-primary">*</span></label>
            <input id="cf-email" type="email" autoComplete="email" required placeholder="you@example.com" value={formData.email} onChange={(e) => update("email", e.target.value)} className={fieldClass("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />
            {errors.email && <p id="err-email" className="mt-1 text-xs text-destructive" role="alert">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="cf-phone" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Phone Number <span className="text-primary">*</span></label>
            <input id="cf-phone" type="tel" autoComplete="tel" required placeholder="+971 50 123 4567" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={fieldClass("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "err-phone" : undefined} />
            {errors.phone && <p id="err-phone" className="mt-1 text-xs text-destructive" role="alert">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="cf-country" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Country / Region <span className="text-primary">*</span></label>
            <input id="cf-country" type="text" autoComplete="country-name" required placeholder="United Arab Emirates" value={formData.country} onChange={(e) => update("country", e.target.value)} className={fieldClass("country")} aria-invalid={!!errors.country} aria-describedby={errors.country ? "err-country" : undefined} />
            {errors.country && <p id="err-country" className="mt-1 text-xs text-destructive" role="alert">{errors.country}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="cf-subject" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Subject <span className="text-primary">*</span></label>
          <input id="cf-subject" type="text" required placeholder="How can we help?" value={formData.subject} onChange={(e) => update("subject", e.target.value)} className={fieldClass("subject")} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "err-subject" : undefined} />
          {errors.subject && <p id="err-subject" className="mt-1 text-xs text-destructive" role="alert">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="cf-order" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Order Number <span className="text-muted-foreground/40">(optional)</span></label>
          <input id="cf-order" type="text" placeholder="#ECM-00000" value={formData.orderNumber} onChange={(e) => update("orderNumber", e.target.value)} className={fieldClass("orderNumber")} />
        </div>

        <div>
          <label htmlFor="cf-message" className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Message <span className="text-primary">*</span></label>
          <textarea id="cf-message" rows={5} required placeholder="Tell us about your inquiry..." value={formData.message} onChange={(e) => update("message", e.target.value)} className={`${fieldClass("message")} resize-none`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined} />
          {errors.message && <p id="err-message" className="mt-1 text-xs text-destructive" role="alert">{errors.message}</p>}
        </div>

        <div>
          <span className="block text-xs font-medium text-muted-foreground mb-2 tracking-wider uppercase">Preferred Contact Method</span>
          <div className="flex gap-4">
            {(["email", "whatsapp", "phone"] as const).map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer group">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${formData.contactMethod === m ? "border-primary bg-primary/20" : "border-border group-hover:border-muted-foreground/40"}`}>
                  {formData.contactMethod === m && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <input type="radio" name="contactMethod" value={m} checked={formData.contactMethod === m} onChange={() => update("contactMethod", m)} className="sr-only" />
                <span className="text-sm text-muted-foreground capitalize">{m}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <button type="button" role="checkbox" aria-checked={formData.consent} onClick={() => update("consent", !formData.consent)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${formData.consent ? "border-primary bg-primary/20" : "border-border hover:border-muted-foreground/40"}`}>
            {formData.consent && <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </button>
          <label className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none" onClick={() => update("consent", !formData.consent)}>
            I agree to be contacted regarding my inquiry. Your information will be handled in accordance with our privacy policy. <span className="text-primary">*</span>
          </label>
        </div>
        {errors.consent && <p className="text-xs text-destructive" role="alert">{errors.consent}</p>}

        {status === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            Something went wrong. Please try again or email us directly at{" "}
            <a href="mailto:admin@ecomm-store.com" className="underline">admin@ecomm-store.com</a>
          </div>
        )}

        <button type="submit" disabled={status === "loading"} className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-primary text-dark font-heading font-semibold tracking-wider text-sm transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,212,255,0.16)] disabled:opacity-50 disabled:pointer-events-none">
          {status === "loading" ? (
            <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" /> Sending...</span>
          ) : "Send Message"}
        </button>
      </fieldset>
    </form>
  );
}
