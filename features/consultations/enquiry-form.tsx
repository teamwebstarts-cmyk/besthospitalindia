"use client";

/**
 * EnquiryForm — A07 (free consultation).
 *
 * Consultation request form (client component). Validates with
 * @/lib/validation, submits via the MOCK @/lib/mock-actions submitEnquiry,
 * shows inline field errors, a pending state, and swaps to a demo
 * confirmation panel with the ENQ reference on success. Nothing is
 * transmitted or stored anywhere; every outcome is labelled demo-only.
 *
 * Catalog: features/consultations/components/enquiry-form.tsx
 * (component file lives at features/consultations/enquiry-form.tsx in this
 * repo's flat feature layout — same folder as the page's other sections).
 */

import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { doctors, hospitals, specialties } from "@/data";
import { submitEnquiry } from "@/lib/mock-actions";
import type { FieldValues } from "@/lib/validation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ReportUploadMock,
  REPORT_UPLOAD_HINT,
  type MockReport,
} from "@/features/consultations/report-upload-mock";
import {
  CalendarIcon,
  CircleAlertIcon,
  CircleCheckBigIcon,
  GlobeIcon,
  InfoIcon,
  LanguagesIcon,
  LoaderCircleIcon,
  LockIcon,
  StethoscopeIcon,
  UserRoundIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Controlled values bag; empty string means "not chosen yet" for selects. */
interface EnquiryValues {
  patientName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
  specialty: string;
  preferredProviderId: string;
  concern: string;
  preferredDate: string;
  consent: boolean;
}

const INITIAL_VALUES: EnquiryValues = {
  patientName: "",
  email: "",
  phone: "",
  country: "",
  preferredLanguage: "",
  specialty: "",
  preferredProviderId: "",
  concern: "",
  preferredDate: "",
  consent: false,
};

type EnquiryField = keyof EnquiryValues;
type EnquiryErrors = Partial<Record<EnquiryField, string>>;

/** Provider option composed from fixture data (no hardcoding in JSX). */
interface ProviderOption {
  value: string;
  label: string;
  group: "Hospitals" | "Doctors";
}

// ---------------------------------------------------------------------------
// Validation schema (client mirror of lib/mock-actions submitEnquiry schema)
// ---------------------------------------------------------------------------

function buildSchema() {
  return {
    patientName: [requiredText("Full name"), minLength(2), maxLength(120)],
    email: [requiredText("Email"), email()],
    phone: [requiredText("Phone"), phone()],
    country: [requiredText("Country")],
    preferredLanguage: [requiredText("Preferred language")],
    specialty: [requiredText("Specialty")],
    concern: [requiredText("Concern"), minLength(10), maxLength(2000)],
    preferredDate: [dateNotInPast()],
    consent: [consentTrue()],
  } as const;
}

// Local, dependency-free validator wrappers (same semantics as lib/validation;
// re-implemented here so the schema stays a plain literal the runner accepts).
// NOTE: These mirror @/lib/validation one-for-one. A small duplication kept
// inside this feature so the schema literal stays type-checked in one place.
function requiredText(label: string) {
  return (value: string | boolean | undefined): string | null => {
    if (typeof value === "boolean") return value ? null : `${label} is required`;
    return (value ?? "").trim().length > 0 ? null : `${label} is required`;
  };
}

function minLength(min: number) {
  return (value: string | boolean | undefined): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    if (text.length === 0) return null;
    return text.length >= min ? null : `Must be at least ${min} characters`;
  };
}

function maxLength(max: number) {
  return (value: string | boolean | undefined): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    return text.length <= max ? null : `Must be at most ${max} characters`;
  };
}

function email() {
  return (value: string | boolean | undefined): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    if (text.length === 0) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? null : "Enter a valid email address";
  };
}

function phone() {
  return (value: string | boolean | undefined): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    if (text.length === 0) return null;
    if (!/^\+?[\d\s\-().]+$/.test(text)) return "Enter a valid phone number";
    const digits = text.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 ? null : "Enter a valid phone number";
  };
}

function dateNotInPast() {
  return (value: string | boolean | undefined): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    if (text.length === 0) return null;
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return "Choose today or a future date";
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfValue = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    return startOfValue.getTime() >= startOfToday.getTime() ? null : "Choose today or a future date";
  };
}

function consentTrue() {
  return (value: string | boolean | undefined): string | null =>
    value === true ? null : "Consent is required to continue";
}

type Schema = ReturnType<typeof buildSchema>;

/** Run the schema; returns inline errors keyed by field (first failure wins). */
function runSchema(schema: Schema, values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const field of Object.keys(schema) as (keyof Schema)[]) {
    const checks = schema[field] as readonly ((
      value: string | boolean | undefined,
      all: FieldValues,
    ) => string | null)[];
    for (const check of checks) {
      const error = check(values[field], values as unknown as FieldValues);
      if (error !== null) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Fixture-driven option lists
// ---------------------------------------------------------------------------

const COUNTRY_OPTIONS = [
  "India",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  "Kenya",
  "Nigeria",
  "Oman",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Other",
] as const;

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Arabic",
  "French",
  "Swahili",
  "Other",
] as const;

const PREFERRED_DATE_MIN_TODAY = (): string => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Value→label maps so closed triggers show labels, not raw values (A14-01). */
const COUNTRY_ITEMS: Record<string, React.ReactNode> = Object.fromEntries(
  COUNTRY_OPTIONS.map((country) => [country, country]),
);
const LANGUAGE_ITEMS: Record<string, React.ReactNode> = Object.fromEntries(
  LANGUAGE_OPTIONS.map((language) => [language, language]),
);
const SPECIALTY_ITEMS: Record<string, React.ReactNode> = Object.fromEntries(
  specialties.map((specialty) => [specialty.id, specialty.name]),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EnquiryFormProps {
  className?: string;
}

export function EnquiryForm({ className }: EnquiryFormProps) {
  const [values, setValues] = React.useState<EnquiryValues>(INITIAL_VALUES);
  const [reports, setReports] = React.useState<MockReport[]>([]);
  const [errors, setErrors] = React.useState<EnquiryErrors>({});
  const [pending, setPending] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<{ reference: string } | null>(null);

  const providerOptions = React.useMemo<ProviderOption[]>(() => {
    const hospitalOptions = hospitals.map((hospital) => ({
      value: hospital.id,
      label: `${hospital.name} — ${hospital.city} (Hospital)`,
      group: "Hospitals" as const,
    }));
    const doctorOptions = doctors.map((doctor) => ({
      value: doctor.id,
      label: `${doctor.name} — ${doctor.city} (Doctor)`,
      group: "Doctors" as const,
    }));
    return [...hospitalOptions, ...doctorOptions];
  }, []);

  // Value→label map so the closed trigger shows the provider label, not the
  // raw id (Base UI renders the raw value without `items`).
  const providerItems = React.useMemo(
    () => Object.fromEntries(providerOptions.map((o) => [o.value, o.label])),
    [providerOptions],
  );

  const setValue = <K extends EnquiryField>(field: K, next: EnquiryValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: next }));
    setErrors((previous) => {
      if (!(field in previous)) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || confirmation) return;

    const nextErrors = runSchema(buildSchema(), values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPending(true);
    setErrors({});

    const result = await submitEnquiry({
      patientName: values.patientName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      preferredLanguage: values.preferredLanguage,
      specialty: values.specialty,
      concern: values.concern,
      consent: values.consent,
      preferredProviderId: values.preferredProviderId || undefined,
      preferredDate: values.preferredDate || undefined,
      reportNames: reports.map((report) => report.name),
    });

    setPending(false);

    if (result.ok) {
      setConfirmation({ reference: result.reference });
      return;
    }
    setErrors(result.errors as EnquiryErrors);
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setReports([]);
    setErrors({});
    setPending(false);
    setConfirmation(null);
  };

  if (confirmation) {
    return (
      <ConfirmationPanel
        reference={confirmation.reference}
        onReset={reset}
        className={className}
      />
    );
  }

  return (
    <Card className={cn("gap-6", className)}>
      <CardHeader>
        <CardTitle>Request your free consultation</CardTitle>
        <CardDescription>
          Share your details and our coordination team will follow up using the contact
          information you provide.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <fieldset className="flex min-w-0 flex-col gap-4" disabled={pending}>
            <legend className="flex items-center gap-2 text-sm font-medium">
              <UserRoundIcon aria-hidden className="size-4 text-muted-foreground" />
              Patient details
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="enquiry-name" error={errors.patientName} required>
                <Input
                  id="enquiry-name"
                  name="patientName"
                  autoComplete="name"
                  placeholder="e.g. Aisha Rahman"
                  value={values.patientName}
                  onChange={(event) => setValue("patientName", event.target.value)}
                  aria-invalid={errors.patientName ? true : undefined}
                  aria-describedby={errors.patientName ? "enquiry-name-error" : undefined}
                  disabled={pending}
                />
              </Field>

              <Field label="Email" htmlFor="enquiry-email" error={errors.email} required>
                <Input
                  id="enquiry-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={(event) => setValue("email", event.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "enquiry-email-error" : undefined}
                  disabled={pending}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Phone"
                htmlFor="enquiry-phone"
                error={errors.phone}
                required
                hint="Include country code, e.g. +91 98xxx xxxxx."
              >
                <Input
                  id="enquiry-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98xxx xxxxx"
                  value={values.phone}
                  onChange={(event) => setValue("phone", event.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={cn(
                    errors.phone ? "enquiry-phone-error" : undefined,
                    !errors.phone ? "enquiry-phone-hint" : undefined,
                  )}
                  disabled={pending}
                />
              </Field>

              <Field label="Country" htmlFor="enquiry-country" error={errors.country} required>
                <Select
                  name="country"
                  value={values.country === "" ? null : values.country}
                  items={COUNTRY_ITEMS}
                  onValueChange={(next) => setValue("country", next ?? "")}
                  disabled={pending}
                >
                  <SelectTrigger
                    id="enquiry-country"
                    aria-label="Country"
                    aria-invalid={errors.country ? true : undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="sr-only">Countries</SelectLabel>
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              label="Preferred language"
              htmlFor="enquiry-language"
              error={errors.preferredLanguage}
              required
            >
              <Select
                name="preferredLanguage"
                value={values.preferredLanguage === "" ? null : values.preferredLanguage}
                items={LANGUAGE_ITEMS}
                onValueChange={(next) => setValue("preferredLanguage", next ?? "")}
                disabled={pending}
              >
                <SelectTrigger
                  id="enquiry-language"
                  aria-label="Preferred language"
                  aria-invalid={errors.preferredLanguage ? true : undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Select preferred language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="sr-only">Languages</SelectLabel>
                    {LANGUAGE_OPTIONS.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </fieldset>

          <Separator />

          <fieldset className="flex min-w-0 flex-col gap-4" disabled={pending}>
            <legend className="flex items-center gap-2 text-sm font-medium">
              <StethoscopeIcon aria-hidden className="size-4 text-muted-foreground" />
              Consultation request
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Specialty" htmlFor="enquiry-specialty" error={errors.specialty} required>
                <Select
                  name="specialty"
                  value={values.specialty === "" ? null : values.specialty}
                  items={SPECIALTY_ITEMS}
                  onValueChange={(next) => setValue("specialty", next ?? "")}
                  disabled={pending}
                >
                  <SelectTrigger
                    id="enquiry-specialty"
                    aria-label="Specialty"
                    aria-invalid={errors.specialty ? true : undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="sr-only">Specialties</SelectLabel>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Preferred provider"
                htmlFor="enquiry-provider"
                error={errors.preferredProviderId}
                hint="Optional — leave as “No preference” to let our coordinator match a provider."
              >
                <Select
                  name="preferredProviderId"
                  value={values.preferredProviderId === "" ? null : values.preferredProviderId}
                  items={providerItems}
                  onValueChange={(next) => setValue("preferredProviderId", next ?? "")}
                  disabled={pending}
                >
                  <SelectTrigger
                    id="enquiry-provider"
                    aria-label="Preferred provider (optional)"
                    aria-describedby={
                      errors.preferredProviderId ? "enquiry-provider-error" : undefined
                    }
                    className="w-full"
                  >
                    <SelectValue placeholder="No preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Hospitals</SelectLabel>
                      {providerOptions
                        .filter((option) => option.group === "Hospitals")
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Doctors</SelectLabel>
                      {providerOptions
                        .filter((option) => option.group === "Doctors")
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              label="Describe your concern"
              htmlFor="enquiry-concern"
              error={errors.concern}
              required
              hint={`${values.concern.length}/2000 characters (minimum 10).`}
              hintId="enquiry-concern-hint"
            >
              <Textarea
                id="enquiry-concern"
                name="concern"
                rows={5}
                placeholder="Briefly describe symptoms, duration and any diagnosis so far."
                value={values.concern}
                onChange={(event) => setValue("concern", event.target.value)}
                aria-invalid={errors.concern ? true : undefined}
                aria-describedby={cn(
                  "enquiry-concern-hint",
                  errors.concern ? "enquiry-concern-error" : undefined,
                )}
                disabled={pending}
                maxLength={2000}
              />
            </Field>

            <Field
              label="Attach reports"
              htmlFor="enquiry-reports"
              hint={REPORT_UPLOAD_HINT}
              hintId="enquiry-reports-hint"
            >
              <ReportUploadMock
                label="Choose files"
                value={reports}
                onChange={setReports}
                disabled={pending}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Preferred date"
                htmlFor="enquiry-date"
                error={errors.preferredDate}
                hint="Optional — today or later."
              >
                <Input
                  id="enquiry-date"
                  name="preferredDate"
                  type="date"
                  min={PREFERRED_DATE_MIN_TODAY()}
                  value={values.preferredDate}
                  onChange={(event) => setValue("preferredDate", event.target.value)}
                  aria-invalid={errors.preferredDate ? true : undefined}
                  aria-describedby={cn(
                    errors.preferredDate ? "enquiry-date-error" : undefined,
                    !errors.preferredDate ? "enquiry-date-hint" : undefined,
                  )}
                  disabled={pending}
                />
              </Field>
            </div>
          </fieldset>

          <Separator />

          <fieldset className="flex min-w-0 flex-col gap-3" disabled={pending}>
            <legend className="sr-only">Consent</legend>

            <div className="flex items-start gap-3">
              <Checkbox
                id="enquiry-consent"
                name="consent"
                checked={values.consent}
                onCheckedChange={(checked) => setValue("consent", checked === true)}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={cn(
                  "enquiry-consent-text",
                  errors.consent ? "enquiry-consent-error" : undefined,
                )}
                disabled={pending}
                className="mt-0.5"
              />
              <Label
                htmlFor="enquiry-consent"
                id="enquiry-consent-text"
                className="flex-1 flex-col items-start gap-1 font-normal"
              >
                <span>
                  I agree to be contacted about this consultation request and accept the{" "}
                  <a
                    href={ROUTES.public.privacy}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href={ROUTES.public.terms}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Terms of Use
                  </a>
                  . I understand submitting this form does not confirm an appointment until a
                  provider agrees.
                </span>
              </Label>
            </div>
            <FieldError id="enquiry-consent-error" message={errors.consent} />
          </fieldset>

          <CardFooter className="flex-col items-stretch gap-3 px-0 pb-0">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon aria-hidden className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Request free consultation"
              )}
            </Button>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <LockIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Medical disclaimer: BestHospitalIndia does not provide medical advice. Submitting
                this form does not create a patient–provider relationship until a provider
                confirms scope and timing.
              </span>
            </p>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Field primitives (local to this feature)
// ---------------------------------------------------------------------------

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
  hintId?: string;
  className?: string;
}

function Field({ label, htmlFor, children, error, required, hint, hintId, className }: FieldProps) {
  const hintIdResolved = hintId ?? `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="justify-start">
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>
      {children}
      {hint ? (
        <p id={hintIdResolved} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <CircleAlertIcon aria-hidden className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Confirmation panel (demo outcome — replaces the form area on success)
// ---------------------------------------------------------------------------

interface ConfirmationPanelProps {
  reference: string;
  onReset: () => void;
  className?: string;
}

function ConfirmationPanel({ reference, onReset, className }: ConfirmationPanelProps) {
  return (
    <Card className={cn("gap-6", className)} aria-live="polite">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CircleCheckBigIcon aria-hidden className="size-5 text-primary" />
          <CardTitle>Request received</CardTitle>
        </div>
        <CardDescription>
          Our coordination team will review your request and contact you using the details you
          provided.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-md border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Reference number</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{reference}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep this reference for follow-up with our team.
          </p>
        </div>
        <Alert>
          <InfoIcon />
          <AlertTitle>What happens next</AlertTitle>
          <AlertDescription>
            A coordinator reviews your concern and matches it with a listed hospital or doctor.
            A provider confirms scope and timing before any consultation is arranged.
          </AlertDescription>
        </Alert>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <GlobeIcon aria-hidden className="size-4 shrink-0" />
            We use your country and language preferences when we respond.
          </li>
          <li className="flex items-center gap-2">
            <LanguagesIcon aria-hidden className="size-4 shrink-0" />
            Attachments you included are shared only with the assigned coordination team.
          </li>
          <li className="flex items-center gap-2">
            <CalendarIcon aria-hidden className="size-4 shrink-0" />
            Your preferred date is a request — confirmation depends on provider availability.
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline" onClick={onReset}>
          Submit another request
        </Button>
      </CardFooter>
    </Card>
  );
}
