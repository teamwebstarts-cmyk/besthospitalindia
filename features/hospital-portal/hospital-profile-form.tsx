"use client"

/**
 * HospitalProfileForm — profile management form (pages/47).
 *
 * Edits a LOCAL draft of the demo hospital's public profile fields: overview,
 * facility type, contact email, city/state display fields. Validation uses
 * @/lib/validation; submission uses the shared mock action `saveProvider`
 * (A01) which simulates latency and returns a demo-only result. Per the spec:
 * changes remain DRAFT — there is no publish action anywhere in this UI
 * (publication requires admin verification, which does not exist in the mock
 * phase). Unsaved changes are tracked and surfaced.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { DemoFormFeedback, type DemoFormFeedbackState } from "@/features/content/demo-notice"
import { saveProvider } from "@/lib/mock-actions"
import { email, maxLength, minLength, required, validate, type FieldValues, type ValidationErrors } from "@/lib/validation"
import { CircleAlertIcon, CircleCheckBigIcon, LoaderCircleIcon, Undo2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HospitalProfileFormProps {
  /** Demo hospital id. */
  hospitalId: string
  /** Initial values resolved from the shared hospital fixture (server side). */
  initialValues: {
    name: string
    city: string
    state: string
    facilityType: string
    overview: string
  }
  className?: string
}

type ProfileValues = {
  name: string
  city: string
  state: string
  facilityType: string
  overview: string
  contactEmail: string
}

function profileSchema(): Record<string, Parameters<typeof validate>[0][string]> {
  return {
    name: [required("Hospital name"), minLength(2), maxLength(160)],
    city: [required("City")],
    state: [required("State")],
    facilityType: [required("Facility type"), maxLength(80)],
    overview: [minLength(40, "Overview should be at least 40 characters"), maxLength(4000)],
    contactEmail: [required("Contact email"), email()],
  }
}

export function HospitalProfileForm({ hospitalId, initialValues, className }: HospitalProfileFormProps) {
  const [values, setValues] = React.useState<ProfileValues>(() => ({
    ...initialValues,
    contactEmail: "profile.demo@example.com",
  }))
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  const [feedback, setFeedback] = React.useState<DemoFormFeedbackState>({ kind: "idle" })
  const [pending, setPending] = React.useState(false)

  const isDirty = React.useMemo(() => {
    return (Object.keys(values) as Array<keyof ProfileValues>).some(
      (key) => values[key] !== initialValues[key as keyof typeof initialValues],
    )
  }, [values, initialValues])

  function setValue(key: keyof ProfileValues, next: string) {
    setValues((current) => ({ ...current, [key]: next }))
    setErrors((current) => {
      if (!current[key]) return current
      const nextErrors = { ...current }
      delete nextErrors[key]
      return nextErrors
    })
  }

  function resetDraft() {
    setValues({ ...initialValues, contactEmail: "profile.demo@example.com" })
    setErrors({})
    setFeedback({ kind: "idle" })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(profileSchema(), values as unknown as FieldValues)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        kind: "error",
        headline: "Draft not saved — fix the highlighted fields.",
        lines: ["No data left this page. Validation ran locally in the demo."],
      })
      return
    }

    setPending(true)
    setFeedback({ kind: "submitting" })
    const result = await saveProvider({
      providerType: "hospital",
      providerId: hospitalId,
      name: values.name,
      city: values.city,
      overview: values.overview,
      contactEmail: values.contactEmail,
      consent: true,
    })
    setPending(false)

    if (result.ok) {
      setFeedback({
        kind: "success",
        headline: "Draft saved (demo).",
        lines: [
          result.message,
          "Changes stay local to this page and are never published — publication requires admin verification, which the demo does not simulate.",
        ],
      })
    } else {
      setErrors(result.errors)
      setFeedback({
        kind: "error",
        headline: "Draft not saved — fix the highlighted fields.",
        lines: ["No data left this page. Validation ran locally in the demo."],
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Public profile draft</CardTitle>
          <CardDescription>
            Fields shown to patients on the public hospital profile. Everything here is a local
            demo draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="hp-name">
                Hospital name <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="hp-name"
                value={values.name}
                onChange={(event) => setValue("name", event.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "hp-name-error" : undefined}
                disabled={pending}
                maxLength={160}
              />
              <FieldError id="hp-name-error" message={errors.name} />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="hp-city">
                City <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="hp-city"
                value={values.city}
                onChange={(event) => setValue("city", event.target.value)}
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={errors.city ? "hp-city-error" : undefined}
                disabled={pending}
              />
              <FieldError id="hp-city-error" message={errors.city} />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="hp-state">
                State <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="hp-state"
                value={values.state}
                onChange={(event) => setValue("state", event.target.value)}
                aria-invalid={errors.state ? true : undefined}
                aria-describedby={errors.state ? "hp-state-error" : undefined}
                disabled={pending}
              />
              <FieldError id="hp-state-error" message={errors.state} />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="hp-facility-type">
                Facility type <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="hp-facility-type"
                value={values.facilityType}
                onChange={(event) => setValue("facilityType", event.target.value)}
                aria-invalid={errors.facilityType ? true : undefined}
                aria-describedby={errors.facilityType ? "hp-facility-type-error" : undefined}
                disabled={pending}
                maxLength={80}
              />
              <FieldError id="hp-facility-type-error" message={errors.facilityType} />
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="hp-email">
                Public contact email <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="hp-email"
                type="email"
                value={values.contactEmail}
                onChange={(event) => setValue("contactEmail", event.target.value)}
                aria-invalid={errors.contactEmail ? true : undefined}
                aria-describedby={errors.contactEmail ? "hp-email-error" : undefined}
                disabled={pending}
              />
              <FieldError id="hp-email-error" message={errors.contactEmail} />
            </div>
          </div>

          <Separator />

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="hp-overview">
              Public overview <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Textarea
              id="hp-overview"
              value={values.overview}
              onChange={(event) => setValue("overview", event.target.value)}
              aria-invalid={errors.overview ? true : undefined}
              aria-describedby={cn(
                "hp-overview-hint",
                errors.overview ? "hp-overview-error" : undefined,
              )}
              disabled={pending}
              rows={5}
              className="min-h-28"
            />
            <p id="hp-overview-hint" className="text-xs text-muted-foreground">
              {values.overview.trim().length}/4000 characters. Describe facilities and services —
              no clinical claims or outcome promises.
            </p>
            <FieldError id="hp-overview-error" message={errors.overview} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t [.border-t]:pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {isDirty ? "You have unsaved draft changes." : "Draft matches the demo fixture."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetDraft}
              disabled={pending || !isDirty}
            >
              <Undo2Icon data-icon="inline-start" />
              Reset draft
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? (
                <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <CircleCheckBigIcon data-icon="inline-start" />
              )}
              Save draft (demo)
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DemoFormFeedback state={feedback} />
    </form>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <CircleAlertIcon aria-hidden className="size-3.5 shrink-0" />
      {message}
    </p>
  )
}
