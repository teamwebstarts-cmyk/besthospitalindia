"use client"

/**
 * DoctorProfileForm — /doctor-portal/profile (pages/58).
 *
 * Edits the demo doctor's local copy of: public biography, experience,
 * languages, consultation modes and city display. Frozen A01 fields
 * (qualifications, registration, hospital links) are shown read-only with a
 * pointer to the credentials module — A10 must not alter shared entity fields.
 *
 * Submission calls the frozen A01 `saveProvider` mock action (providerType
 * "doctor"), which validates, waits 300–600 ms and resolves locally. The
 * confirmation states plainly that nothing was saved to any backend.
 */

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { DemoFormFeedback, type DemoFormFeedbackState } from "@/features/content/demo-notice"
import { doctorProfileHref } from "@/constants/routes"
import { saveProvider } from "@/lib/mock-actions"
import type { FieldValues, ValidationErrors } from "@/lib/validation"
import { maxLength, minLength, required, validate } from "@/lib/validation"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/types"

export interface DoctorProfileFormProps {
  doctor: Doctor
  className?: string
}

const BIO_MAX = 2000

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Konkani",
] as const

const MODE_OPTIONS: ReadonlyArray<{ value: "in_person" | "video" | "phone"; label: string }> = [
  { value: "in_person", label: "In-person visits" },
  { value: "video", label: "Video consultation" },
  { value: "phone", label: "Phone consultation" },
]

const IDLE: DemoFormFeedbackState = { kind: "idle" }

export function DoctorProfileForm({ doctor, className }: DoctorProfileFormProps) {
  const [name, setName] = useState(doctor.name)
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState(
    doctor.yearsExperience === null ? "" : String(doctor.yearsExperience),
  )
  const [languages, setLanguages] = useState<string[]>(doctor.languages)
  const [modes, setModes] = useState<string[]>(["in_person"])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [feedback, setFeedback] = useState<DemoFormFeedbackState>(IDLE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  function markDirty() {
    setIsDirty(true)
  }

  function clearFieldError(field: string) {
    setErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  function toggleValue(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values: FieldValues = {
      name: name.trim(),
      bio: bio.trim(),
      experience: experience.trim(),
    }
    const validationErrors = validate(
      {
        name: [required("Display name"), minLength(2), maxLength(160)],
        bio: [minLength(20, "Add at least 20 characters so patients know what to expect"), maxLength(BIO_MAX)],
        experience: [],
      },
      values,
    )
    if (experience.trim() !== "") {
      const parsed = Number(experience)
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 70) {
        validationErrors.experience = "Enter whole years between 0 and 70."
      }
    }
    if (languages.length === 0) {
      validationErrors.languages = "Select at least one consultation language."
    }
    if (modes.length === 0) {
      validationErrors.modes = "Select at least one consultation mode."
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setFeedback({
        kind: "error",
        headline: "Please fix the highlighted fields and try again.",
        lines: [],
      })
      return
    }

    setErrors({})
    setFeedback({ kind: "submitting" })
    setIsSubmitting(true)
    try {
      const result = await saveProvider({
        providerType: "doctor",
        providerId: doctor.id,
        name: name.trim(),
        city: doctor.city,
        overview: bio.trim(),
        contactEmail: `${doctor.slug}@example.com`,
        consent: true,
      })
      if (result.ok) {
        setIsDirty(false)
        setFeedback({
          kind: "success",
          headline: "Draft saved locally (demo).",
          lines: [
            `Simulated save completed in the browser — reference timestamp ${result.savedAt}.`,
            result.message,
          ],
        })
      } else {
        setErrors(result.errors)
        setFeedback({
          kind: "error",
          headline: "The demo save was rejected. Please review the highlighted fields.",
          lines: [],
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function fieldError(field: string): string | undefined {
    return errors[field]
  }

  function errorId(field: string): string {
    return `doctor-profile-${field}-error`
  }

  function describedBy(field: string): string | undefined {
    return fieldError(field) ? errorId(field) : undefined
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("space-y-6", className)}>
      {/* Identity — read-only fixture identity vs editable display fields */}
      <Card>
        <CardHeader>
          <CardTitle>Public identity</CardTitle>
          <p className="text-sm text-muted-foreground">
            What patients see on your public doctor profile. Fixtures marked read-only are
            part of the demo verification record and cannot be edited here.
          </p>
        </CardHeader>
        <CardContent className="gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doctor-profile-name">
                Display name <span aria-hidden className="text-destructive"> *</span>
              </Label>
              <Input
                id="doctor-profile-name"
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  clearFieldError("name")
                  markDirty()
                }}
                aria-invalid={fieldError("name") ? true : undefined}
                aria-describedby={describedBy("name")}
              />
              {fieldError("name") ? (
                <p id={errorId("name")} className="text-xs font-medium text-destructive">
                  {fieldError("name")}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctor-profile-experience">Years of experience</Label>
              <Input
                id="doctor-profile-experience"
                name="experience"
                type="number"
                min={0}
                max={70}
                step={1}
                inputMode="numeric"
                placeholder={doctor.yearsExperience === null ? "Not recorded (demo)" : undefined}
                value={experience}
                onChange={(event) => {
                  setExperience(event.target.value)
                  clearFieldError("experience")
                  markDirty()
                }}
                aria-invalid={fieldError("experience") ? true : undefined}
                aria-describedby={describedBy("experience")}
              />
              {fieldError("experience") ? (
                <p id={errorId("experience")} className="text-xs font-medium text-destructive">
                  {fieldError("experience")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doctor-profile-bio">Public biography</Label>
            <Textarea
              id="doctor-profile-bio"
              name="bio"
              rows={5}
              placeholder="Describe your practice focus and what patients can expect. (Demo only.)"
              value={bio}
              onChange={(event) => {
                setBio(event.target.value)
                clearFieldError("bio")
                markDirty()
              }}
              maxLength={BIO_MAX}
              aria-invalid={fieldError("bio") ? true : undefined}
              aria-describedby={describedBy("bio") ?? "doctor-profile-bio-hint"}
            />
            {fieldError("bio") ? (
              <p id={errorId("bio")} className="text-xs font-medium text-destructive">
                {fieldError("bio")}
              </p>
            ) : (
              <p id="doctor-profile-bio-hint" className="text-xs text-muted-foreground">
                {bio.length}/{BIO_MAX} characters. Never include outcome promises or
                curable-claim language — see the platform content rules.
              </p>
            )}
          </div>

          {/* Read-only verification record */}
          <Separator />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Specialization (fixture)
              </dt>
              <dd className="font-medium text-foreground">{doctor.specialization}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Location
              </dt>
              <dd className="font-medium text-foreground">
                {doctor.city}, {doctor.state}, {doctor.country}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Qualifications (fixture)
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {doctor.qualifications.map((qualification) => (
                  <Badge key={qualification} variant="outline">
                    {qualification}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Registration (fixture)
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {doctor.registration.numberMasked} · {doctor.registration.authority}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Languages + consultation modes */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demo preferences shown on your public profile summary.
          </p>
        </CardHeader>
        <CardContent className="gap-5">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              Consultation languages <span aria-hidden className="text-destructive">*</span>
            </legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {LANGUAGE_OPTIONS.map((language) => {
                const id = `doctor-profile-language-${language.toLowerCase()}`
                return (
                  <div key={language} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={languages.includes(language)}
                      onCheckedChange={(checked) => {
                        setLanguages((previous) =>
                          checked === true
                            ? [...previous, language]
                            : previous.filter((entry) => entry !== language),
                        )
                        clearFieldError("languages")
                        markDirty()
                      }}
                      aria-describedby={describedBy("languages")}
                    />
                    <Label htmlFor={id} className="text-sm font-normal">
                      {language}
                    </Label>
                  </div>
                )
              })}
            </div>
            {fieldError("languages") ? (
              <p id={errorId("languages")} className="text-xs font-medium text-destructive">
                {fieldError("languages")}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              Consultation modes <span aria-hidden className="text-destructive">*</span>
            </legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {MODE_OPTIONS.map((mode) => {
                const id = `doctor-profile-mode-${mode.value}`
                return (
                  <div key={mode.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={modes.includes(mode.value)}
                      onCheckedChange={(checked) => {
                        setModes((previous) =>
                          checked === true
                            ? [...previous, mode.value]
                            : previous.filter((entry) => entry !== mode.value),
                        )
                        clearFieldError("modes")
                        markDirty()
                      }}
                      aria-describedby={describedBy("modes")}
                    />
                    <Label htmlFor={id} className="text-sm font-normal">
                      {mode.label}
                    </Label>
                  </div>
                )
              })}
            </div>
            {fieldError("modes") ? (
              <p id={errorId("modes")} className="text-xs font-medium text-destructive">
                {fieldError("modes")}
              </p>
            ) : null}
          </fieldset>
        </CardContent>
      </Card>

      {/* Actions + feedback */}
      <div className="space-y-3">
        <DemoFormFeedback state={feedback} />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving (demo)…" : "Save draft (demo)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            render={
              <a
                href={doctorProfileHref(doctor.slug)}
                aria-disabled="true"
                title="Public doctor profile page is implemented by the doctor-directory agent (A05) — link intentionally inert in this demo build."
              />
            }
          >
            Preview public profile
          </Button>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {isDirty
              ? "Unsaved local changes — saving writes to demo memory only."
              : "No unsaved changes."}
          </p>
        </div>
      </div>
    </form>
  )
}
