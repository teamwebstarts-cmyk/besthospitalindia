"use client"

import Link from "next/link"

import { EnquiryForm } from "@/features/content/enquiry-form"
import type { EnquiryFormField } from "@/features/content/enquiry-form"
import { email, maxLength, minLength, phone, required } from "@/lib/validation"
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
  message: [required("Message is required"), minLength(10), maxLength(2000)],
}

/**
 * General contact enquiry form for /contact. Mock-only: validates locally and
 * resolves with a generated demo reference — nothing is sent or stored.
 */
export function ContactForm({
  className,
  variant = "card",
}: {
  className?: string
  variant?: "card" | "hero" | "contact"
}) {
  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    return { ok: true as const, reference: `MSG-${suffix}` }
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
              ["message"],
            ]
          : undefined
      }
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel={isHero ? "Continue" : "Send message"}
      successNote="We will reply to the email you provided — usually within one business day."
      footer={isHero || isContact ? termsFooter : undefined}
      className={cn(
        isContact &&
          "border-border/70 bg-card shadow-md ring-1 ring-border/50",
        className,
      )}
    />
  )
}
