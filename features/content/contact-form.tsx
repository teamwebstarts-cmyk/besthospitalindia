"use client"

import Link from "next/link"

import { EnquiryForm } from "@/features/content/enquiry-form"
import type { EnquiryFormField } from "@/features/content/enquiry-form"
import { email, maxLength, minLength, phone, required, type FieldValues } from "@/lib/validation"
import type { ValidationSchema } from "@/lib/validation"
import { cn } from "@/lib/utils"

const purposeOptions = [
  { value: "patient-support", label: "Patient support" },
  { value: "partnership", label: "Partnership" },
  { value: "consultation", label: "Free consultation" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const

const fields: readonly EnquiryFormField[] = [
  {
    kind: "text",
    name: "name",
    label: "Your name",
    placeholder: "Full name",
    required: true,
    autoComplete: "name",
  },
  {
    kind: "text",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
    required: true,
    autoComplete: "email",
  },
  {
    kind: "text",
    name: "phone",
    label: "Phone (optional)",
    type: "tel",
    placeholder: "+91 …",
    autoComplete: "tel",
  },
  {
    kind: "select",
    name: "purpose",
    label: "Purpose",
    placeholder: "What is this about?",
    options: purposeOptions,
    required: true,
  },
  {
    kind: "select",
    name: "preferredCity",
    label: "Preferred city",
    placeholder: "Delhi or Indore",
    options: [
      { value: "delhi", label: "Delhi" },
      { value: "indore", label: "Indore" },
    ],
    required: true,
  },
  {
    kind: "textarea",
    name: "message",
    label: "Message",
    placeholder: "How can we help?",
    required: true,
    rows: 5,
  },
]

const schema: ValidationSchema = {
  name: [required("Your name is required"), minLength(2), maxLength(120)],
  email: [required("Email is required"), email()],
  phone: [phone()],
  purpose: [required("Choose a purpose")],
  preferredCity: [required("Choose Delhi or Indore")],
  message: [required("Message is required"), minLength(10), maxLength(2000)],
}

/**
 * Contact messages are stored as leads for admin and the chosen city desk.
 */
export function ContactForm({
  className,
  variant = "card",
}: {
  className?: string
  variant?: "card" | "hero" | "contact"
}) {
  const handleSubmit = async (values: FieldValues) => {
    const purpose = purposeOptions.find((option) => option.value === values.purpose)?.label ?? "Message"
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: typeof values.phone === "string" ? values.phone : "",
        audience: "indian",
        state: "Not collected",
        preferredCity: values.preferredCity,
        comment: `${purpose}: ${values.message ?? ""}`,
      }),
    })
    const payload = (await response.json().catch(() => null)) as { lead?: { id: string }; error?: string } | null
    if (!response.ok || !payload?.lead) {
      return { ok: false as const, errors: { message: payload?.error ?? "Could not save your message." } }
    }
    return { ok: true as const, reference: payload.lead.id }
  }

  const isHero = variant === "hero"
  const isContact = variant === "contact"
  const enquiryVariant = isHero ? "hero" : "card"

  const termsFooter = (
    <p
      className={cn(
        "text-center text-xs leading-relaxed",
        isHero ? "text-primary-foreground/80" : "text-muted-foreground",
      )}
    >
      By submitting you agree to our{" "}
      <Link
        href="/terms"
        className={cn(
          "underline underline-offset-2",
          isHero ? "text-primary-foreground" : "text-primary",
        )}
      >
        Terms
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        className={cn(
          "underline underline-offset-2",
          isHero ? "text-primary-foreground" : "text-primary",
        )}
      >
        Privacy Policy
      </Link>
      .
    </p>
  )

  return (
    <EnquiryForm
      title="Contact message"
      variant={enquiryVariant}
      intro={
        isHero
          ? {
              title: "Let us help you",
              description: "Share your details — we will get back to you shortly.",
            }
          : undefined
      }
      fields={fields}
      fieldRows={
        isHero || isContact
          ? [
              ["name", "email"],
              ["phone", "purpose"],
              ["preferredCity"],
              ["message"],
            ]
          : undefined
      }
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel={isHero ? "Continue" : "Send message"}
      successNote="Your message is stored for admin and the Delhi or Indore desk. It is not sent to a hospital or a doctor."
      footer={isHero || isContact ? termsFooter : undefined}
      className={cn(
        isContact &&
          "border-border/70 bg-card shadow-md ring-1 ring-border/50",
        className,
      )}
    />
  )
}
