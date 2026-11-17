"use client"

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
    placeholder: "Full name (demo)",
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
    placeholder: "Tell the demo team what you need.",
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
export function ContactForm({ className }: { className?: string }) {
  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    return { ok: true as const, reference: `MSG-${suffix}` }
  }

  return (
    <EnquiryForm
      title="General contact enquiry (demo)"
      fields={fields}
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel="Send message"
      successNote="Demo only: your message was not sent or stored. In production this would reach the team matching your chosen purpose."
      className={className}
    />
  )
}
