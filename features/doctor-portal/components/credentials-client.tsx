"use client"

/**
 * CredentialsClient — /doctor-portal/credentials (pages/63).
 *
 * Maintains qualification and registration evidence metadata per spec.
 * Fixture-derived rows (qualifications + registration from the frozen Doctor
 * record) render with their fixture verification status — never marked verified
 * beyond what the fixture states. "Add credential" creates a local placeholder
 * that starts explicitly unverified, and "request review" flips only that local
 * placeholder to a pending-review note.
 *
 * No upload exists: the add form takes metadata labels only, matching the
 * mock-phase boundary ("No real upload; pending vs verified clear").
 */

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { cn } from "@/lib/utils"
import { maxLength, required, validate } from "@/lib/validation"
import type { Doctor, VerificationStatus } from "@/types"

// ---------------------------------------------------------------------------
// Local placeholder contract (PROPOSED, mirrors types/provider.ts DoctorCredential
// semantics without touching A01 files)
// ---------------------------------------------------------------------------

export interface CredentialRow {
  id: string
  kind: "qualification" | "registration"
  title: string
  authority: string
  /** ISO year string or null. */
  issuedYear: string | null
  /** Fixture status, or the local placeholder lifecycle for added rows. */
  status: VerificationStatus
  source: "fixture" | "local"
  /** Demo note shown for local rows ("requested review" etc.). */
  note?: string
}

export function makeInitialCredentialRows(doctor: Doctor): CredentialRow[] {
  const rows: CredentialRow[] = doctor.qualifications.map((qualification, index) => ({
    id: `cred-fixture-qual-${index}`,
    kind: "qualification",
    title: qualification,
    authority: "Issuing institution (demo fixture — authority not recorded)",
    issuedYear: null,
    // Qualification strings carry no status in the fixture; the honest mock
    // state is "pending" verification (never asserted verified).
    status: "pending",
    source: "fixture",
  }))
  rows.push({
    id: "cred-fixture-registration",
    kind: "registration",
    title: `Medical registration ${doctor.registration.numberMasked}`,
    authority: doctor.registration.authority,
    issuedYear: null,
    status: doctor.registration.status,
    source: "fixture",
  })
  return rows
}

const KIND_OPTIONS = [
  { value: "medical_degree", label: "Medical degree" },
  { value: "postgraduate_degree", label: "Postgraduate degree" },
  { value: "fellowship", label: "Fellowship" },
  { value: "super_specialty", label: "Super-specialty qualification" },
  { value: "other", label: "Other credential" },
] as const

type KindOption = (typeof KIND_OPTIONS)[number]["value"]

export interface CredentialsClientProps {
  doctor: Doctor
  className?: string
}

export function CredentialsClient({ doctor, className }: CredentialsClientProps) {
  const [rows, setRows] = useState(() => makeInitialCredentialRows(doctor))
  const [title, setTitle] = useState("")
  const [authority, setAuthority] = useState("")
  const [year, setYear] = useState("")
  const [kind, setKind] = useState<KindOption>("medical_degree")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  const fixtureRows = useMemo(() => rows.filter((row) => row.source === "fixture"), [rows])
  const localRows = useMemo(() => rows.filter((row) => row.source === "local"), [rows])

  function addCredential() {
    const validationErrors = validate(
      {
        title: [required("Credential title"), maxLength(160)],
        authority: [required("Issuing authority"), maxLength(160)],
        year: [],
      },
      { title, authority, year },
    )
    if (year.trim() !== "") {
      const parsedYear = Number(year)
      if (!Number.isInteger(parsedYear) || parsedYear < 1920 || parsedYear > 2026) {
        validationErrors.year = "Enter a whole year between 1920 and 2026."
      }
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setRows((previous) => [
      ...previous,
      {
        id: `cred-local-${Date.now()}`,
        kind: "qualification",
        title: title.trim(),
        authority: authority.trim(),
        issuedYear: year.trim() === "" ? null : year.trim(),
        // A just-added placeholder is NEVER verified — it starts unverified
        // and only reaches "pending" when a review is requested.
        status: "unverified",
        source: "local",
        note: "Local placeholder — metadata only, no document attached.",
      },
    ])
    setTitle("")
    setAuthority("")
    setYear("")
    setKind("medical_degree")
    setErrors({})
    setNotice(
      "Credential placeholder added locally with status “unverified”. Request a review to move it to the demo pending queue — nothing is uploaded or verified.",
    )
  }

  function requestReview(id: string) {
    setRows((previous) =>
      previous.map((row) =>
        row.id === id && row.source === "local"
          ? { ...row, status: "pending", note: "Review requested in this demo session." }
          : row,
      ),
    )
    setNotice("Review requested (demo) — the row moved to the pending queue. No reviewer was notified.")
  }

  function removeLocalRow(id: string) {
    setRows((previous) => previous.filter((row) => row.id !== id || row.source === "fixture"))
    setNotice("Local placeholder removed. Fixture rows cannot be removed.")
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Verification queue summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="gap-1">
            <p className="text-sm text-muted-foreground">Verified credentials</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {rows.filter((row) => row.status === "verified").length}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="gap-1">
            <p className="text-sm text-muted-foreground">Pending review</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {rows.filter((row) => row.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="gap-1">
            <p className="text-sm text-muted-foreground">Local placeholders (unverified)</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {localRows.filter((row) => row.status === "unverified").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {notice ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          {notice}
        </p>
      ) : null}

      {/* Verification record rows */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence record</CardTitle>
          <CardDescription>
            Qualification and registration metadata backing your verification status and MER
            assessment. Fixture rows are read-only; local placeholders stay in this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          {fixtureRows.length > 0 ? (
            <section aria-label="Fixture credential records" className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                From the verification fixture
              </p>
              <ul className="space-y-2">
                {fixtureRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.authority}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-muted-foreground">
                        Fixture
                      </Badge>
                      <VerificationBadge status={row.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {localRows.length > 0 ? (
            <section aria-label="Local credential placeholders" className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Local placeholders (this session only)
              </p>
              <ul className="space-y-2">
                {localRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-dashed px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.authority}
                        {row.issuedYear ? ` · issued ${row.issuedYear}` : ""}
                      </p>
                      {row.note ? <p className="text-xs text-muted-foreground">{row.note}</p> : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge status={row.status} />
                      {row.status === "unverified" ? (
                        <Button variant="outline" size="xs" onClick={() => requestReview(row.id)}>
                          Request review
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => removeLocalRow(row.id)}
                        aria-label={`Remove local placeholder ${row.title}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <EmptyState
              title="No local credential placeholders yet"
              description="Use the add form below to practice the credential metadata flow. Added rows start unverified and never touch the fixture record."
            />
          )}
        </CardContent>
      </Card>

      {/* Add credential placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Add a credential placeholder</CardTitle>
          <CardDescription>
            Metadata only — there is no document upload in this phase. New rows are marked
            unverified until a demo review is requested.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="credential-kind">Credential type</Label>
              <Select
                value={kind}
                onValueChange={(value) => {
                  if (typeof value === "string") setKind(value as KindOption)
                }}
              >
                <SelectTrigger id="credential-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credential-year">Year issued (optional)</Label>
              <Input
                id="credential-year"
                type="number"
                min={1920}
                max={2026}
                step={1}
                inputMode="numeric"
                value={year}
                onChange={(event) => {
                  setYear(event.target.value)
                  setErrors((previous) => ({ ...previous, year: "" }))
                }}
                aria-invalid={errors.year ? true : undefined}
                aria-describedby={errors.year ? "credential-year-error" : undefined}
              />
              {errors.year ? (
                <p id="credential-year-error" className="text-xs font-medium text-destructive">
                  {errors.year}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credential-title">
                Credential title <span aria-hidden className="text-destructive"> *</span>
              </Label>
              <Input
                id="credential-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setErrors((previous) => ({ ...previous, title: "" }))
                }}
                placeholder="e.g. Fellowship in robotic surgery (demo)"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "credential-title-error" : undefined}
              />
              {errors.title ? (
                <p id="credential-title-error" className="text-xs font-medium text-destructive">
                  {errors.title}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credential-authority">
                Issuing authority <span aria-hidden className="text-destructive"> *</span>
              </Label>
              <Input
                id="credential-authority"
                value={authority}
                onChange={(event) => {
                  setAuthority(event.target.value)
                  setErrors((previous) => ({ ...previous, authority: "" }))
                }}
                placeholder="e.g. Demo surgical board (fictional)"
                aria-invalid={errors.authority ? true : undefined}
                aria-describedby={errors.authority ? "credential-authority-error" : undefined}
              />
              {errors.authority ? (
                <p id="credential-authority-error" className="text-xs font-medium text-destructive">
                  {errors.authority}
                </p>
              ) : null}
            </div>
          </div>
          <Button variant="outline" onClick={addCredential}>
            Add credential (demo)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
