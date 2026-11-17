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
import { email, maxLength, minLength, phone, required } from "@/lib/validation"
import type { ValidationSchema } from "@/lib/validation"

export interface PartnerInterestFormProps {
  /** Which partner flavour drives the field set and copy. */
  kind: "hospital" | "doctor"
  className?: string
}

const consentLabel =
  "I understand this is a demo form. Nothing is submitted, stored or followed up on, and no approval, listing or rating is promised. (Required)"

/** Shared base fields for both partner forms (explicitly typed). */
function baseFields(kind: "hospital" | "doctor"): EnquiryFormTextField[] {
  const isHospital = kind === "hospital"
  const organisationField: EnquiryFormTextField = {
    kind: "text",
    name: "organisation",
    label: "Hospital / organisation name",
    placeholder: "e.g. City Care Hospital (demo)",
    required: true,
  }
  const fullNameField: EnquiryFormTextField = {
    kind: "text",
    name: "fullName",
    label: "Full name",
    placeholder: "e.g. Dr. Priya Nair (demo)",
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
}: PartnerInterestFormProps) {
  const isHospital = kind === "hospital"

  const handleSubmit = async () => {
    // Simulated local submission — mirrors mock-actions latency and result shape.
    await new Promise((resolve) => setTimeout(resolve, 450))
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    return {
      ok: true as const,
      reference: `${isHospital ? "HOS" : "DOC"}-${suffix}`,
    }
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
      "A short summary helps the demo review — nothing is actually reviewed.",
    required: true,
    rows: 5,
  }
  const consentField: EnquiryFormConsentField = {
    kind: "consent",
    name: "consent",
    label: consentLabel,
  }

  const fields: readonly EnquiryFormField[] = [
    ...baseFields(kind),
    isHospital ? sizeField : experienceField,
    messageField,
    consentField,
  ]

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
    phone: [required("Phone is required"), phone()],
    [isHospital ? "bedCapacity" : "experience"]: [required()],
    message: [required(), minLength(10), maxLength(2000)],
    consent: [required()],
  }

  return (
    <EnquiryForm
      title={
        isHospital
          ? "Hospital interest form (demo)"
          : "Doctor interest form (demo)"
      }
      fields={fields}
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel="Submit interest request"
      successNote="Demo only: this interest request was not sent, stored or reviewed anywhere, and no approval or listing is implied."
      className={className}
    />
  )
}
