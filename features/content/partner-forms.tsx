"use client"

import { useState } from "react"

import { EnquiryForm } from "@/features/content/enquiry-form"
import { PartnerEmailOtpInline } from "@/features/partner/partner-email-otp-inline"
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
  /** Signed-in partner: email is fixed and register OTP is skipped. */
  sessionEmail?: string
  skipRegisterOtp?: boolean
  onSubmitted?: () => void
}

const consentLabel = "I confirm these details are for listing review, not a patient query."

function photoUrlField(kind: "hospital" | "doctor"): EnquiryFormTextField {
  return {
    kind: "text",
    name: "imageUrl",
    label: kind === "doctor" ? "Profile photo URL (optional)" : "Facility image URL (optional)",
    placeholder: "https://… public link to your photo or logo",
    required: false,
  }
}

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
      placeholder: "name@hospital.com",
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
      placeholder: "e.g. Madhya Pradesh",
      required: false,
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
 * Partner interest form for /for-hospitals, /for-doctors, and /auth apply.
 * Submissions stay pending until an admin approves them on the portal.
 */
export function PartnerInterestForm({
  kind,
  className,
  compact = false,
  sessionEmail,
  skipRegisterOtp = false,
  onSubmitted,
}: PartnerInterestFormProps) {
  const isHospital = kind === "hospital"
  const [emailGate, setEmailGate] = useState({ email: "", otp: "" })
  const [emailVerifiedUi, setEmailVerifiedUi] = useState(false)
  const lockedEmail = sessionEmail?.trim().toLowerCase() ?? ""

  const handleSubmit = async (values: FieldValues) => {
    const name = isHospital ? values.organisation : values.fullName
    const submitEmail = lockedEmail || String(values.email ?? "").trim().toLowerCase()
    const response = await fetch("/api/catalogue/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        name,
        email: submitEmail,
        phone: values.phone,
        city: values.city,
        state: values.state,
        imageUrl: values.imageUrl,
        overview: values.message,
        note: values.message,
        ...(skipRegisterOtp ? {} : { otp: emailGate.otp }),
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
      ? "About the facility (specialties, accreditations, services)"
      : "About your practice (specialty, qualifications, hospital associations)",
    placeholder: "Helps our team verify your listing before it goes live.",
    required: true,
    rows: compact ? 3 : 5,
  }
  const consentField: EnquiryFormConsentField = {
    kind: "consent",
    name: "consent",
    label: consentLabel,
  }

  const extraField = isHospital ? sizeField : experienceField
  const fields: readonly EnquiryFormField[] = [
    photoUrlField(kind),
    ...baseFields(kind),
    extraField,
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
    message: [required(), minLength(10), maxLength(2000)],
    [isHospital ? "bedCapacity" : "experience"]: [required()],
    consent: [required()],
  }

  const fieldRows = compact
    ? isHospital
      ? [
          ["imageUrl"],
          ["organisation", "contactName"],
          ["email", "phone"],
          ["city", "state"],
          ["bedCapacity"],
          ["message"],
          ["consent"],
        ]
      : [
          ["imageUrl"],
          ["fullName", "contactName"],
          ["email", "phone"],
          ["city", "state"],
          ["experience"],
          ["message"],
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
      successNote="Our team will review this listing. It appears on the website only after admin approval."
      className={className}
      embedded={compact}
      fieldRows={fieldRows}
      initialValues={lockedEmail ? { email: lockedEmail } : undefined}
      readOnlyFields={lockedEmail ? ["email"] : undefined}
      onSuccess={onSubmitted}
      hintWhenSubmitBlocked="Verify the work email with the code we sent, then submit."
      canSubmit={
        skipRegisterOtp
          ? undefined
          : (values) => {
              const email = String(values.email ?? "").trim().toLowerCase()
              return email.length > 3 && email === emailGate.email && emailGate.otp.length >= 6
            }
      }
      renderBeforeSubmit={
        skipRegisterOtp
          ? undefined
          : (values) => (
              <PartnerEmailOtpInline
                email={String(values.email ?? "")}
                purpose="register"
                verified={emailVerifiedUi && emailGate.email === String(values.email ?? "").trim().toLowerCase()}
                onVerifiedChange={(next) => {
                  setEmailVerifiedUi(next)
                  if (!next) setEmailGate({ email: "", otp: "" })
                }}
                onOtpConfirmed={(otp) => {
                  const email = String(values.email ?? "").trim().toLowerCase()
                  setEmailGate({ email, otp })
                  setEmailVerifiedUi(true)
                }}
              />
            )
      }
    />
  )
}