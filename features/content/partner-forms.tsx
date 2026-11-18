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
  "I agree to be contacted about listing on BestHospitalIndia and understand that approval, listing and ratings follow our partner review process. (Required)"

/** Shared base fields for both partner forms (explicitly typed). */
function baseFields(kind: "hospital" | "doctor"): EnquiryFormTextField[] {
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
      "A short summary helps our partnerships team route your request.",
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
        isHospital ? "Hospital interest form" : "Doctor interest form"
      }
      fields={fields}
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel="Submit interest request"
      successNote="Our partnerships team will review your request and contact you using the details provided."
      className={className}
    />
  )
}
