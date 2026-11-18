"use client"

import Link from "next/link"

import { EnquiryForm } from "@/features/content/enquiry-form"
import type { EnquiryFormField } from "@/features/content/enquiry-form"
import { email, maxLength, minLength, phone, required } from "@/lib/validation"
import type { ValidationSchema } from "@/lib/validation"

const purposeOptions = [
  { value: "patient-support", label: "Patient support question" },
  { value: "partnership", label: "Hospital / doctor partnership" },
  { value: "consultation", label: "Free consultation initiative" },
  { value: "feedback", label: "Website feedback" },
  { value: "other", label: "Something else" },
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
  variant?: "card" | "hero"
}) {
  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    return { ok: true as const, reference: `MSG-${suffix}` }
  }

  const isHero = variant === "hero"

  return (
    <EnquiryForm
      title="General contact enquiry"
      variant={variant}
      intro={
        isHero
          ? {
              title: "Let us help you",
              description:
                "Share your details and our team will get back to you shortly.",
            }
          : undefined
      }
      fields={fields}
      fieldRows={
        isHero
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
      successNote="Our team will respond to the email address you provided, usually within one business day."
      footer={
        isHero ? (
          <p className="text-center text-xs leading-relaxed text-primary-foreground/80">
            By submitting you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        ) : undefined
      }
      className={className}
    />
  )
}
