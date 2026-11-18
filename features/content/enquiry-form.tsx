"use client"

import { Fragment, useId, useState, type ReactNode } from "react"
import { SendIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  DemoFormFeedback,
  type DemoFormFeedbackState,
} from "@/features/content/demo-notice"
import type {
  FieldValues,
  ValidationErrors,
  ValidationSchema,
} from "@/lib/validation"
import { validate } from "@/lib/validation"
import { cn } from "@/lib/utils"

export interface EnquiryFormTextField {
  kind: "text"
  name: string
  label: string
  type?: "text" | "email" | "tel" | "url"
  placeholder?: string
  required?: boolean
  autoComplete?: string
  /** Renders full-width (default true when part of a 2-col grid row). */
  fullWidth?: boolean
}

export interface EnquiryFormSelectField {
  kind: "select"
  name: string
  label: string
  placeholder?: string
  options: readonly { value: string; label: string }[]
  required?: boolean
}

export interface EnquiryFormTextareaField {
  kind: "textarea"
  name: string
  label: string
  placeholder?: string
  required?: boolean
  rows?: number
}

export interface EnquiryFormConsentField {
  kind: "consent"
  name: string
  label: string
}

export type EnquiryFormField =
  | EnquiryFormTextField
  | EnquiryFormSelectField
  | EnquiryFormTextareaField
  | EnquiryFormConsentField

export interface EnquiryFormIntro {
  title: string
  description: string
}

export interface EnquiryFormProps {
  /** Accessible form title (visually hidden if heading is supplied). */
  title: string
  /** Optional visible heading above the form. */
  heading?: string
  /** Card (default) or primary-filled hero panel. */
  variant?: "card" | "hero"
  /** Hero variant: title + lead above the fields. */
  intro?: EnquiryFormIntro
  fields: readonly EnquiryFormField[]
  schema: ValidationSchema
  /** Mock submit — resolves with { ok: true; reference } or { ok: false; errors }. */
  onSubmit: (
    values: FieldValues
  ) => Promise<
    { ok: true; reference: string } | { ok: false; errors: ValidationErrors }
  >
  /** Success lines shown in the visible confirmation panel. */
  successNote: string
  submitLabel?: string
  className?: string
  /** Optional note below the submit control (e.g. terms on hero forms). */
  footer?: ReactNode
  /**
   * When set, fields render in rows (e.g. `[["name","email"],["message"]]`).
   * Rows with two names use a two-column grid on `sm+`.
   */
  fieldRows?: readonly (readonly string[])[]
}

type Values = Record<string, string | boolean | undefined>

const initialFeedback: DemoFormFeedbackState = { kind: "idle" }

/**
 * Config-driven mock enquiry form (contact / for-hospitals / for-doctors).
 * Controlled inputs, per-field inline validation errors, a busy state and a
 * visible demo confirmation panel. No toasts; no real submission anywhere.
 */
export function EnquiryForm({
  title,
  heading,
  variant = "card",
  intro,
  fields,
  schema,
  onSubmit,
  successNote,
  submitLabel = "Submit",
  className,
  footer,
  fieldRows,
}: EnquiryFormProps) {
  const isHero = variant === "hero"
  const reactId = useId()
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [feedback, setFeedback] =
    useState<DemoFormFeedbackState>(initialFeedback)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textValue = (name: string) =>
    typeof values[name] === "string" ? (values[name] as string) : ""

  function setValue(name: string, value: string | boolean | undefined) {
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => {
      if (!previous[name]) return previous
      const next = { ...previous }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validate(schema, values as FieldValues)
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
      const result = await onSubmit(values)
      if (result.ok) {
        setValues({})
        setFeedback({
          kind: "success",
          headline: `Request received — reference ${result.reference}`,
          lines: [successNote],
        })
      } else {
        setErrors(result.errors)
        setFeedback({
          kind: "error",
          headline:
            "We could not submit your request. Please review the fields below.",
          lines: [],
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function fieldError(name: string): string | undefined {
    return errors[name]
  }

  function errorId(name: string): string {
    return `${reactId}-${name}-error`
  }

  function describedBy(name: string): string | undefined {
    return fieldError(name) ? errorId(name) : undefined
  }

  const labelClass = isHero ? "text-primary-foreground" : undefined

  const fieldByName = Object.fromEntries(fields.map((field) => [field.name, field]))
  const layoutRows = fieldRows ?? fields.map((field) => [field.name] as const)

  return (
    <section
      aria-label={title}
      className={cn(
        isHero
          ? "rounded-2xl border-0 bg-primary p-5 text-primary-foreground shadow-xl sm:p-6 [&_[data-slot=select-trigger]]:border-white/20 [&_[data-slot=select-trigger]]:bg-white [&_[data-slot=select-trigger]]:text-foreground [&_[data-slot=select-trigger]]:shadow-none [&_[data-slot=select-trigger]]:data-placeholder:text-muted-foreground [&_input]:border-white/20 [&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-foreground/45 [&_input]:dark:bg-white [&_input]:dark:text-foreground [&_textarea]:border-white/20 [&_textarea]:bg-white [&_textarea]:text-foreground [&_textarea]:placeholder:text-foreground/45 [&_textarea]:dark:bg-white [&_textarea]:dark:text-foreground [&_[data-slot=select-trigger]]:dark:bg-white"
          : "rounded-2xl border bg-card p-6 shadow-xs sm:p-8",
        className
      )}
    >
      {isHero && intro ? (
        <div className="mb-5 space-y-1.5">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <ShieldCheckIcon aria-hidden className="size-5 shrink-0 opacity-90" />
            {intro.title}
          </p>
          <p className="text-sm leading-relaxed text-primary-foreground/85">
            {intro.description}
          </p>
        </div>
      ) : null}
      {heading && !isHero ? (
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {heading}
        </h2>
      ) : null}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn("space-y-4", isHero && "space-y-3.5")}
      >
        {layoutRows.map((row) => {
          const rowFields = row
            .map((name) => fieldByName[name])
            .filter((field): field is EnquiryFormField => field !== undefined)

          if (rowFields.length === 0) return null

          const rowBody = rowFields.map((field) => {
          if (field.kind === "consent") {
            const error = fieldError(field.name)
            return (
              <div key={field.name} className="space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id={`${reactId}-${field.name}`}
                    name={field.name}
                    checked={values[field.name] === true}
                    onCheckedChange={(checked) =>
                      setValue(field.name, checked === true)
                    }
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(field.name)}
                  />
                  <Label
                    htmlFor={`${reactId}-${field.name}`}
                    className={cn(
                      "text-sm leading-snug font-normal",
                      isHero ? "text-primary-foreground/90" : "text-muted-foreground"
                    )}
                  >
                    {field.label}
                  </Label>
                </div>
                {error ? (
                  <p
                    id={errorId(field.name)}
                    className="text-xs font-medium text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            )
          }

          if (field.kind === "select") {
            const error = fieldError(field.name)
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`${reactId}-${field.name}`} className={labelClass}>
                  {field.label}
                  {field.required ? (
                    <span aria-hidden className="text-destructive">
                      {" "}
                      *
                    </span>
                  ) : null}
                </Label>
                <Select
                  value={
                    typeof values[field.name] === "string"
                      ? (values[field.name] as string)
                      : null
                  }
                  items={Object.fromEntries(
                    field.options.map((option) => [option.value, option.label]),
                  )}
                  onValueChange={(value) =>
                    setValue(
                      field.name,
                      typeof value === "string" ? value : undefined
                    )
                  }
                >
                  <SelectTrigger
                    id={`${reactId}-${field.name}`}
                    className="w-full"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(field.name)}
                  >
                    {typeof values[field.name] === "string" &&
                    values[field.name] !== "" ? (
                      <SelectValue />
                    ) : (
                      <SelectValue>
                        {field.placeholder ??
                          `Select ${field.label.toLowerCase()}`}
                      </SelectValue>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error ? (
                  <p
                    id={errorId(field.name)}
                    className="text-xs font-medium text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            )
          }

          if (field.kind === "textarea") {
            const error = fieldError(field.name)
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`${reactId}-${field.name}`} className={labelClass}>
                  {field.label}
                  {field.required ? (
                    <span aria-hidden className="text-destructive">
                      {" "}
                      *
                    </span>
                  ) : null}
                </Label>
                <Textarea
                  id={`${reactId}-${field.name}`}
                  name={field.name}
                  rows={field.rows ?? 5}
                  placeholder={field.placeholder}
                  value={textValue(field.name)}
                  onChange={(event) => setValue(field.name, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy(field.name)}
                />
                {error ? (
                  <p
                    id={errorId(field.name)}
                    className="text-xs font-medium text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            )
          }

          const error = fieldError(field.name)
          return (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={`${reactId}-${field.name}`} className={labelClass}>
                {field.label}
                {field.required ? (
                  <span aria-hidden className="text-destructive">
                    {" "}
                    *
                  </span>
                ) : null}
              </Label>
              <Input
                id={`${reactId}-${field.name}`}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={textValue(field.name)}
                onChange={(event) => setValue(field.name, event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(field.name)}
              />
              {error ? (
                <p
                  id={errorId(field.name)}
                  className="text-xs font-medium text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </div>
          )
          })

          const rowKey = row.join("-")
          if (rowFields.length > 1) {
            return (
              <div
                key={rowKey}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start"
              >
                {rowBody}
              </div>
            )
          }

          return <Fragment key={rowKey}>{rowBody}</Fragment>
        })}

        <div className="space-y-3">
          <Button
            type="submit"
            variant="cta"
            className={cn(
              "font-semibold shadow-sm",
              isHero ? "w-full rounded-md px-6" : "rounded-full px-6"
            )}
            disabled={isSubmitting}
          >
            {!isHero ? <SendIcon aria-hidden /> : null}
            {isSubmitting ? "Submitting…" : submitLabel}
            {isHero && !isSubmitting ? (
              <span aria-hidden className="ml-0.5">
                →
              </span>
            ) : null}
          </Button>
          {footer}
          <DemoFormFeedback
            state={feedback}
            className={isHero ? "text-primary-foreground/90 [&_a]:text-primary-foreground" : undefined}
          />
        </div>
      </form>
    </section>
  )
}
