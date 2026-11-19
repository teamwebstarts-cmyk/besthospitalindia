"use client"

import { EnquiryForm } from "@/features/content/enquiry-form"
import type {
  EnquiryFormField,
  EnquiryFormTextField,
  EnquiryFormSelectField,
  EnquiryFormTextareaField,
  EnquiryFormConsentField,
} from "@/features/content/enquiry-form"
import {
  doctorExperienceOptions,
  hospitalSizeOptions,
} from "@/features/content/home-content"
import { email, maxLength, minLength, phone, required, type FieldValues, type ValidationSchema } from "@/lib/validation"

export interface PartnerInterestFormProps {
  /** Which partner flavour drives the field set and copy. */
  kind: "hospital" | "doctor"
  className?: string
  compact?: boolean
}

const consentLabel = "I confirm these details are for listing review, not a patient query."

/** Shared base fields for both partner forms (explicitly typed). */
function baseFields(kind: "hospital" | "doctor", compact: boolean): EnquiryFormTextField[] {
  const isHospital = kind === "hospital"
  const organisationField: EnquiryFormTextField = {
    kind: "text",
    name: "organisation",
    label: "Hospital / organisation name",
    placeholder: "e.g. City Care Hospital",
    required: true,
  }
  const fullNameField: EnquiryFormTextField = {
    kind: "text",
    name: "fullName",
    label: "Full name",
    placeholder: "e.g. Dr. Priya Nair",
    required: true,
    autoComplete: "name",
  }
  return [
    isHospital ? organisationField : fullNameField,
    {
      kind: "text",
      name: "contactName",
      label: "Contact person",
      placeholder: "Who should we reach?",
      required: true,
    },
    {
      kind: "text",
      name: "email",
      label: "Work email",
      type: "email",
      placeholder: "name@example.com",
      required: true,
      autoComplete: "email",
    },
    {
      kind: "text",
      name: "city",
      label: "City",
      placeholder: "City of the hospital or practice",
      required: true,
    },
    {
      kind: "text",
      name: "state",
      label: "State",
      placeholder: "e.g. Kerala",
      required: false,
    },
    ...(compact
      ? []
      : [
          {
            kind: "text" as const,
            name: "imageUrl",
            label: "Photo URL (optional)",
            placeholder: "https://…",
            required: false,
          } satisfies EnquiryFormTextField,
        ]),
    {
      kind: "text",
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "+91 …",
      required: true,
      autoComplete: "tel",
    },
  ]
}

/**
 * Mock partner interest form for /for-hospitals and /for-doctors. Validates
 * with lib/validation and resolves through a local async submit that mirrors
 * the lib/mock-actions result contract ({ ok, reference } | { ok, errors }).
 */
export function PartnerInterestForm({
  kind,
  className,
  compact = false,
}: PartnerInterestFormProps) {
  const isHospital = kind === "hospital"

  const handleSubmit = async (values: FieldValues) => {
    const name = isHospital ? values.organisation : values.fullName
    const response = await fetch("/api/catalogue/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        name,
        email: values.email,
        phone: values.phone,
        city: values.city,
        state: values.state,
        imageUrl: values.imageUrl,
        overview: values.message,
        note: values.message,
      }),
    })
    const payload = (await response.json().catch(() => null)) as { submission?: { id: string }; error?: string } | null
    if (!response.ok || !payload?.submission) {
      return { ok: false as const, errors: { email: payload?.error ?? "Could not save the submission." } }
    }
    return { ok: true as const, reference: payload.submission.id }
  }

  const sizeField: EnquiryFormSelectField = {
    kind: "select",
    name: "bedCapacity",
    label: "Facility size",
    placeholder: "Select approximate size",
    options: hospitalSizeOptions,
    required: true,
  }
  const experienceField: EnquiryFormSelectField = {
    kind: "select",
    name: "experience",
    label: "Years of practice",
    placeholder: "Select experience range",
    options: doctorExperienceOptions,
    required: true,
  }
  const messageField: EnquiryFormTextareaField = {
    kind: "textarea",
    name: "message",
    label: isHospital
      ? "About the facility (specialties, accreditations, city)"
      : "About your practice (specialty, qualifications, hospital associations)",
    placeholder:
      "A short summary helps our partnerships team route your request.",
    required: true,
    rows: 5,
  }
  const consentField: EnquiryFormConsentField = {
    kind: "consent",
    name: "consent",
    label: consentLabel,
  }

  const extraField = isHospital ? sizeField : experienceField
  const fields: readonly EnquiryFormField[] = compact
    ? [...baseFields(kind, true), extraField, consentField]
    : [...baseFields(kind, false), extraField, messageField, consentField]

  const schema: ValidationSchema = {
    [isHospital ? "organisation" : "fullName"]: [
      required(),
      minLength(2),
      maxLength(160),
    ],
    contactName: [
      required("Contact person is required"),
      minLength(2),
      maxLength(120),
    ],
    email: [required("Email is required"), email()],
    city: [required("City is required"), minLength(2), maxLength(80)],
    phone: [required("Phone is required"), phone()],
    [isHospital ? "bedCapacity" : "experience"]: [required()],
    ...(compact ? {} : { message: [required(), minLength(10), maxLength(2000)] }),
    consent: [required()],
  }

  const fieldRows = compact
    ? isHospital
      ? [
          ["organisation", "contactName"],
          ["email", "phone"],
          ["city", "state"],
          ["bedCapacity"],
          ["consent"],
        ]
      : [
          ["fullName", "contactName"],
          ["email", "phone"],
          ["city", "state"],
          ["experience"],
          ["consent"],
        ]
    : undefined

  return (
    <EnquiryForm
      title={isHospital ? "Hospital registration" : "Doctor registration"}
      heading={compact ? (isHospital ? "Register hospital" : "Register doctor") : undefined}
      fields={fields}
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel="Submit for approval"
      successNote="Admin will review this listing. It goes live only after approval."
      className={className}
      embedded={compact}
      fieldRows={fieldRows}
    />
  )
}
