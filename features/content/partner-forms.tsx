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
      name: "city",
      label: "City",
      placeholder: "City of the hospital or practice",
      required: true,
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
    city: [required("City is required"), minLength(2), maxLength(80)],
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
      successNote="Admin will review this listing. It is not a patient query and is not sent to a hospital or a city desk until you are approved."
      className={className}
    />
  )
}
