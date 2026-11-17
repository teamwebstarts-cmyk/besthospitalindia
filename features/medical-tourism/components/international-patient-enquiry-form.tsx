"use client"

/**
 * InternationalPatientEnquiryForm — FR-009 international case enquiry (Agent A06).
 *
 * Contract source: implementation/12-international-enquiry.md + 03-user-journeys.md.
 * - Controlled form, section-by-section validation with @/lib/validation
 *   (required, email, phone, minLength/maxLength, dateNotInPast, consentTrue).
 * - Submit goes through @/lib/mock-actions submitEnquiry (typed union) and
 *   STOPS at a visible mock confirmation with a demo reference number.
 * - No navigation away, no toast, no simulated admin review / coordinator /
 *   provider response — those are documented future backend states.
 * - Report "attachments" are name/type/size labels only (ReportUploadMock);
 *   nothing is transmitted.
 * - Travel preferences (accommodation, visa help, transport) are recorded as
 *   informational selections echoed in the confirmation summary.
 */

import * as React from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/constants/routes"
import { specialties, treatmentById } from "@/data"
import { submitEnquiry, type MockActionFailure } from "@/lib/mock-actions"
import {
  consentTrue,
  dateNotInPast,
  email,
  maxLength,
  minLength,
  phone,
  required,
  validate,
  type FieldValues,
  type ValidationErrors,
} from "@/lib/validation"
import { cn } from "@/lib/utils"
import {
  CircleCheckBigIcon,
  CircleExclamationPointIcon,
  InfoIcon,
} from "lucide-react"
import { ReportUploadMock, type MockReport } from "./report-upload-mock"

// ---------------------------------------------------------------------------
// Types & fixtures
// ---------------------------------------------------------------------------

export interface InternationalPatientEnquiryFormProps {
  /** Preselected specialty id (e.g. from /treatments deep links). */
  defaultSpecialty?: string
  /** Preselected treatment id (echoed as preferred-procedure context). */
  defaultTreatment?: string
  className?: string
}

/** Country options are demo-only fixture text, per 09 mock-data rules. */
const COUNTRY_OPTIONS = [
  "India (demo)",
  "Bangladesh (demo)",
  "Kenya (demo)",
  "Nigeria (demo)",
  "Oman (demo)",
  "United Kingdom (demo)",
  "United States (demo)",
  "Uzbekistan (demo)",
] as const

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Arabic",
  "Bengali",
  "French",
  "Russian",
  "Somali",
  "Swahili",
] as const

const CITY_OPTIONS = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Jaipur",
  "Kochi",
  "Mumbai",
  "New Delhi",
  "Varanasi",
] as const

/** Values shape mirrors submitEnquiry's SubmitEnquiryPayload plus UI-only extras. */
const INITIAL_VALUES = {
  patientName: "",
  email: "",
  phone: "",
  country: "",
  preferredLanguage: "",
  specialty: "",
  city: "",
  concern: "",
  preferredDate: "",
  consent: false,
  travelAccommodation: false,
  travelVisa: false,
  travelTransport: false,
}

type Values = typeof INITIAL_VALUES

interface ConfirmationState {
  reference: string
  summary: {
    patientName: string
    email: string
    phone: string
    country: string
    preferredLanguage: string
    specialtyName: string
    city: string
    preferredDate: string
    reports: readonly MockReport[]
    travel: string[]
  }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function formatDateLabel(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Value→label maps so closed triggers show labels, not raw values (A14-01). */
const SPECIALTY_ITEMS: Record<string, React.ReactNode> = Object.fromEntries(
  specialties.map((specialty) => [specialty.id, specialty.name]),
)

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InternationalPatientEnquiryForm({
  defaultSpecialty,
  defaultTreatment,
  className,
}: InternationalPatientEnquiryFormProps) {
  const [values, setValues] = React.useState<Values>(() => ({
    ...INITIAL_VALUES,
    specialty:
      defaultSpecialty && specialties.some((s) => s.id === defaultSpecialty)
        ? defaultSpecialty
        : "",
  }))
  const [reports, setReports] = React.useState<readonly MockReport[]>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [failure, setFailure] = React.useState<MockActionFailure | null>(null)
  const [confirmation, setConfirmation] = React.useState<ConfirmationState | null>(null)

  const formId = React.useId()

  const setValue = React.useCallback(
    <K extends keyof Values>(key: K, value: Values[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    []
  )

  const specialtyName =
    specialties.find((s) => s.id === values.specialty)?.name ?? ""
  const defaultTreatmentName = defaultTreatment
    ? treatmentById[defaultTreatment]?.name ?? null
    : null

  /** Local section-by-section validation; mirrors submitEnquiry's schema plus UI-only fields. */
  const validateAll = (source: Values): ValidationErrors => {
    const errors = validate(
      {
        patientName: [required("Full name"), minLength(2), maxLength(120)],
        email: [required("Email"), email()],
        phone: [required("Phone"), phone()],
        country: [required("Country")],
        preferredLanguage: [required("Preferred language")],
        specialty: [required("Specialty")],
        concern: [required("Concern"), minLength(10), maxLength(2000)],
        preferredDate: [dateNotInPast()],
        consent: [consentTrue()],
      },
      source as unknown as FieldValues
    )
    return errors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)
    setFailure(null)

    const localErrors = validateAll(values)
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors)
      return
    }
    setErrors({})
    setSubmitting(true)

    const payload = {
      patientName: values.patientName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      preferredLanguage: values.preferredLanguage,
      specialty: values.specialty,
      concern: values.concern,
      consent: values.consent,
      preferredDate: values.preferredDate || undefined,
      reportNames: reports.map((report) => report.name),
    }

    const result = await submitEnquiry(payload)
    setSubmitting(false)

    if (!result.ok) {
      setFailure(result)
      setErrors(result.errors)
      return
    }

    const travel: string[] = []
    if (values.travelAccommodation) travel.push("Accommodation guidance")
    if (values.travelVisa) travel.push("Visa & documents information")
    if (values.travelTransport) travel.push("Local transport information")

    setConfirmation({
      reference: result.reference,
      summary: {
        patientName: values.patientName,
        email: values.email,
        phone: values.phone,
        country: values.country,
        preferredLanguage: values.preferredLanguage,
        specialtyName,
        city: values.city,
        preferredDate: values.preferredDate,
        reports,
        travel,
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Confirmation state — the frontend journey STOPS here (03-user-journeys.md)
  // ---------------------------------------------------------------------------

  if (confirmation) {
    const { reference, summary } = confirmation
    return (
      <div className={cn("space-y-4", className)} aria-live="polite">
        <Card>
          <CardHeader>
            <span
              aria-hidden
              className="mb-1 flex size-10 items-center justify-center rounded-full bg-success/10 text-success"
            >
              <CircleCheckBigIcon className="size-5" />
            </span>
            <CardTitle className="text-lg font-semibold">
              Demo enquiry recorded — reference {reference}
            </CardTitle>
            <CardDescription>
              This is a mock confirmation for the demo platform. Nothing was
              sent to any hospital, doctor or coordinator, and no real case
              exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <Alert>
              <InfoIcon />
              <AlertTitle>Demo only — no real submission</AlertTitle>
              <AlertDescription>
                <p>
                  Reference <strong>{reference}</strong> is a randomly generated
                  demo label. It is not stored, and admin review or coordinator
                  assignment will not happen — those steps are documented future
                  backend states.
                </p>
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                What you entered (demo record)
              </h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <dt className="text-muted-foreground">Patient</dt>
                <dd className="font-medium text-foreground">{summary.patientName}</dd>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="font-medium break-words text-foreground">
                  {summary.email} · {summary.phone}
                </dd>
                <dt className="text-muted-foreground">Country / language</dt>
                <dd className="font-medium text-foreground">
                  {summary.country} · {summary.preferredLanguage}
                </dd>
                <dt className="text-muted-foreground">Specialty</dt>
                <dd className="font-medium text-foreground">
                  {summary.specialtyName || "—"}
                </dd>
                <dt className="text-muted-foreground">Preferred city</dt>
                <dd className="font-medium text-foreground">
                  {summary.city || "No preference entered"}
                </dd>
                <dt className="text-muted-foreground">Preferred date</dt>
                <dd className="font-medium text-foreground">
                  {summary.preferredDate
                    ? formatDateLabel(summary.preferredDate)
                    : "Not specified"}
                </dd>
                <dt className="text-muted-foreground">Report labels</dt>
                <dd className="font-medium text-foreground">
                  {summary.reports.length > 0
                    ? summary.reports.map((r) => r.name).join(", ")
                    : "None listed"}
                </dd>
                <dt className="text-muted-foreground">Travel information</dt>
                <dd className="font-medium text-foreground">
                  {summary.travel.length > 0 ? summary.travel.join(", ") : "None selected"}
                </dd>
              </dl>
            </div>

            <p className="text-xs text-muted-foreground">
              Next steps (admin review, coordinator assignment, provider
              response) are future backend capabilities and are intentionally
              not simulated here. Explore{" "}
              <Link
                href={ROUTES.public.treatments}
                className="underline underline-offset-4 hover:text-foreground"
              >
                treatments
              </Link>{" "}
              or{" "}
              <Link
                href={ROUTES.public.medicalTourism}
                className="underline underline-offset-4 hover:text-foreground"
              >
                medical tourism support
              </Link>{" "}
              in the meantime.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmation(null)
                setSubmitAttempted(false)
                setErrors({})
                setFailure(null)
              }}
            >
              Fill another demo enquiry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={`${formId}-status`}
    >
      <p id={`${formId}-status`} className="text-xs text-muted-foreground" role="status">
        Demo form: validation runs locally and submission is simulated. Nothing
        leaves this browser session.
      </p>

      {failure ? (
        <Alert variant="destructive">
          <CircleExclamationPointIcon />
          <AlertTitle>We could not record the demo enquiry</AlertTitle>
          <AlertDescription>
            <p>Fix the highlighted fields below and try again.</p>
          </AlertDescription>
        </Alert>
      ) : null}
      {submitAttempted && Object.keys(errors).length > 0 && !failure ? (
        <Alert variant="destructive">
          <CircleExclamationPointIcon />
          <AlertTitle>Some fields need attention</AlertTitle>
          <AlertDescription>
            <p>Review the highlighted fields in each section, then submit again.</p>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Section 1 — patient/contact details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">1. Patient & contact details</CardTitle>
          <CardDescription>
            Demo contact data only — do not enter real personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-patient-name">Full name</Label>
              <Input
                id="enquiry-patient-name"
                name="patientName"
                autoComplete="name"
                placeholder="e.g. A. Karim (demo)"
                value={values.patientName}
                onChange={(e) => setValue("patientName", e.target.value)}
                aria-invalid={
                  submitAttempted && Boolean(errors.patientName) ? true : undefined
                }
                aria-describedby={
                  submitAttempted && errors.patientName
                    ? "enquiry-patient-name-error"
                    : undefined
                }
              />
              {submitAttempted ? (
                <FieldError
                  id="enquiry-patient-name-error"
                  message={errors.patientName}
                />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-email">Email</Label>
              <Input
                id="enquiry-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value)}
                aria-invalid={submitAttempted && Boolean(errors.email) ? true : undefined}
                aria-describedby={
                  submitAttempted && errors.email ? "enquiry-email-error" : undefined
                }
              />
              {submitAttempted ? (
                <FieldError id="enquiry-email-error" message={errors.email} />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-phone">Phone</Label>
              <Input
                id="enquiry-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 00000 00000 (demo)"
                value={values.phone}
                onChange={(e) => setValue("phone", e.target.value)}
                aria-invalid={submitAttempted && Boolean(errors.phone) ? true : undefined}
                aria-describedby={
                  submitAttempted && errors.phone ? "enquiry-phone-error" : undefined
                }
              />
              {submitAttempted ? (
                <FieldError id="enquiry-phone-error" message={errors.phone} />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-country">Country of residence</Label>
              <Select
                value={values.country || null}
                onValueChange={(value) => setValue("country", value ?? "")}
              >
                <SelectTrigger
                  id="enquiry-country"
                  className="w-full"
                  aria-invalid={
                    submitAttempted && Boolean(errors.country) ? true : undefined
                  }
                >
                  <SelectValue placeholder="Select a country (demo list)" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitAttempted ? (
                <FieldError
                  id="enquiry-country-error"
                  message={submitAttempted ? errors.country : undefined}
                />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-language">Preferred language</Label>
              <Select
                value={values.preferredLanguage || null}
                onValueChange={(value) => setValue("preferredLanguage", value ?? "")}
              >
                <SelectTrigger
                  id="enquiry-language"
                  className="w-full"
                  aria-invalid={
                    submitAttempted && Boolean(errors.preferredLanguage) ? true : undefined
                  }
                >
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitAttempted ? (
                <FieldError
                  id="enquiry-language-error"
                  message={submitAttempted ? errors.preferredLanguage : undefined}
                />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — case details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">2. Case details</CardTitle>
          <CardDescription>
            Specialty, treatment context and preferred demo city.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-specialty">Specialty</Label>
              <Select
                value={values.specialty || null}
                items={SPECIALTY_ITEMS}
                onValueChange={(value) => setValue("specialty", value ?? "")}
              >
                <SelectTrigger
                  id="enquiry-specialty"
                  className="w-full"
                  aria-invalid={
                    submitAttempted && Boolean(errors.specialty) ? true : undefined
                  }
                >
                  <SelectValue placeholder="Select a specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitAttempted ? (
                <FieldError
                  id="enquiry-specialty-error"
                  message={submitAttempted ? errors.specialty : undefined}
                />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enquiry-city">Preferred city (optional)</Label>
              <Select
                value={values.city || null}
                onValueChange={(value) => setValue("city", value ?? "")}
              >
                <SelectTrigger id="enquiry-city" className="w-full">
                  <SelectValue placeholder="No city preference" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Demo list — cities mirror the fictional provider fixtures.
              </p>
            </div>
          </div>
          {defaultTreatmentName ? (
            <p className="text-xs text-muted-foreground">
              Referred from a treatment page (demo context:{" "}
              <span className="font-medium text-foreground">{defaultTreatmentName}</span>
              ). Mention it in your concern below if relevant.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Section 3 — medical history / concern */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            3. Medical history & concern
          </CardTitle>
          <CardDescription>
            Describe the concern in your own words. No diagnosis is offered on
            this platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-concern">Concern / medical history</Label>
            <Textarea
              id="enquiry-concern"
              name="concern"
              rows={5}
              placeholder="Describe symptoms, duration, existing reports and anything the receiving team should know (demo text)."
              value={values.concern}
              onChange={(e) => setValue("concern", e.target.value)}
              aria-invalid={submitAttempted && Boolean(errors.concern) ? true : undefined}
              aria-describedby={
                submitAttempted && errors.concern ? "enquiry-concern-error" : undefined
              }
            />
            {submitAttempted ? (
              <FieldError id="enquiry-concern-error" message={errors.concern} />
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Medical reports (optional, mock)</Label>
            <ReportUploadMock
              reports={reports}
              onAdd={setReports}
              onRemove={(index) =>
                setReports((prev) => prev.filter((_, i) => i !== index))
              }
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="enquiry-date">Preferred consultation date (optional)</Label>
            <Input
              id="enquiry-date"
              name="preferredDate"
              type="date"
              value={values.preferredDate}
              onChange={(e) => setValue("preferredDate", e.target.value)}
              aria-invalid={
                submitAttempted && Boolean(errors.preferredDate) ? true : undefined
              }
              aria-describedby={
                submitAttempted && errors.preferredDate
                  ? "enquiry-date-error"
                  : "enquiry-date-hint"
              }
            />
            <p id="enquiry-date-hint" className="text-xs text-muted-foreground">
              Must be today or later. Dates are handled in your local time zone.
            </p>
            {submitAttempted ? (
              <FieldError id="enquiry-date-error" message={errors.preferredDate} />
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — travel preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            4. Travel preferences (optional)
          </CardTitle>
          <CardDescription>
            Tick what you would like information about. This platform does not
            book or guarantee any service.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="travel-accommodation"
              name="travelAccommodation"
              checked={values.travelAccommodation}
              onCheckedChange={(checked) => setValue("travelAccommodation", checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="travel-accommodation"
              className="flex-col items-start gap-0.5 font-normal"
            >
              <span className="font-medium text-foreground">
                Accommodation guidance
              </span>
              <span className="text-xs text-muted-foreground">
                Information about staying near demo provider locations.
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="travel-visa"
              name="travelVisa"
              checked={values.travelVisa}
              onCheckedChange={(checked) => setValue("travelVisa", checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="travel-visa" className="flex-col items-start gap-0.5 font-normal">
              <span className="font-medium text-foreground">
                Visa & documents information
              </span>
              <span className="text-xs text-muted-foreground">
                General guidance pointers — not legal or immigration advice.
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="travel-transport"
              name="travelTransport"
              checked={values.travelTransport}
              onCheckedChange={(checked) => setValue("travelTransport", checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="travel-transport"
              className="flex-col items-start gap-0.5 font-normal"
            >
              <span className="font-medium text-foreground">
                Local transport information
              </span>
              <span className="text-xs text-muted-foreground">
                General orientation for demo cities — no pickup is arranged.
              </span>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Section 5 — consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">5. Consent</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="enquiry-consent"
              name="consent"
              checked={values.consent}
              onCheckedChange={(checked) => setValue("consent", checked === true)}
              aria-invalid={submitAttempted && Boolean(errors.consent) ? true : undefined}
              aria-describedby={
                submitAttempted && errors.consent ? "enquiry-consent-error" : undefined
              }
              className="mt-0.5"
            />
            <Label htmlFor="enquiry-consent" className="flex-col items-start gap-0.5 font-normal">
              <span className="font-medium text-foreground">
                I consent to my demo enquiry details being used in this mock
                flow.
              </span>
              <span className="text-xs text-muted-foreground">
                Required. Nothing is stored or shared — the consent timestamp is
                simulated locally.
              </span>
            </Label>
          </div>
          {submitAttempted ? (
            <FieldError id="enquiry-consent-error" message={errors.consent} />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button type="submit" size="lg" variant="cta" className="rounded-full px-6 font-semibold shadow-sm" disabled={submitting}>
          {submitting ? "Recording demo enquiry…" : "Submit demo enquiry"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        By continuing you understand this is a demonstration platform: no real
        medical service, booking or advice is provided, and no data is sent
        anywhere.
      </p>
    </form>
  )
}
