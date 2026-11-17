"use client"

/**
 * DocumentChecklistManager — verification documents (pages/53).
 *
 * Checklist of demo document rows (shared HospitalDocument contract, derived
 * in demo-context) with status/expiry display, a local metadata-only "upload"
 * flow (file name/type/size captured in state, nothing transmitted — same
 * boundary as the shared ReportUploadMock), and a remove action for rows the
 * demo user added.
 *
 * Spec boundary: "Verified only when admin status is verified" — the UI never
 * flips a document to verified; only rows whose fixture status is verified
 * display as verified.
 */

import * as React from "react"

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildDocumentRows, type DemoDocumentRow } from "@/features/hospital-portal/demo-context"
import type { HospitalDocumentType } from "@/types"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  FileTextIcon,
  PaperclipIcon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface DocumentChecklistManagerProps {
  hospital: Parameters<typeof buildDocumentRows>[0]
  /** Demo "today" (ISO date) shared with the dashboard for expiry logic. */
  todayISO: string
  className?: string
}

const DOCUMENT_TYPE_LABELS: Record<HospitalDocumentType, string> = {
  registration_certificate: "Registration certificate",
  accreditation: "Accreditation",
  clinical_establishment_license: "Clinical establishment licence",
  bio_medical_waste_authorization: "Bio-medical waste authorization",
  insurance_empanelment: "Insurance empanelment",
  other: "Other document",
}

const TYPE_OPTIONS = Object.keys(DOCUMENT_TYPE_LABELS) as HospitalDocumentType[]

/** Days until expiry shown with a warning tone. */
const EXPIRY_WARNING_DAYS = 90

export function DocumentChecklistManager({ hospital, todayISO, className }: DocumentChecklistManagerProps) {
  const fixtureRows = React.useMemo(
    () => buildDocumentRows(hospital, todayISO),
    [hospital, todayISO],
  )

  // Local rows added via the mock upload; never persisted.
  const [localRows, setLocalRows] = React.useState<DemoDocumentRow[]>([])
  const [pendingName, setPendingName] = React.useState("")
  const [pendingType, setPendingType] = React.useState<HospitalDocumentType | "">("")
  const [pendingFile, setPendingFile] = React.useState<{ name: string; size: number } | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [flash, setFlash] = React.useState<string | null>(null)

  const allRows = React.useMemo(() => [...fixtureRows, ...localRows], [fixtureRows, localRows])

  const nowMs = new Date(todayISO).getTime()
  const summary = React.useMemo(() => {
    let verified = 0
    let pendingReview = 0
    let expiring = 0
    let expired = 0
    for (const row of allRows) {
      if (row.document.status === "verified") verified += 1
      if (row.document.status === "under_review" || row.document.status === "submitted") {
        pendingReview += 1
      }
      if (row.expiresAt) {
        const days = Math.ceil((new Date(row.expiresAt).getTime() - nowMs) / 86_400_000)
        if (days <= 0) expired += 1
        else if (days <= EXPIRY_WARNING_DAYS) expiring += 1
      }
    }
    return { verified, pendingReview, expiring, expired }
  }, [allRows, nowMs])

  function addPendingMetadata() {
    setFormError(null)
    if (pendingName.trim().length < 4) {
      setFormError("Give the document a name (at least 4 characters).")
      return
    }
    if (!pendingType) {
      setFormError("Choose a document type from the demo list.")
      return
    }
    if (!pendingFile) {
      setFormError("Pick a demo file first — metadata-only, nothing is uploaded.")
      return
    }

    const id = `demo-doc-local-${Date.now()}`
    setLocalRows((current) => [
      ...current,
      {
        document: {
          id,
          hospitalId: hospital.id,
          name: pendingName.trim(),
          type: pendingType,
          status: "submitted",
          fileLabel: pendingFile.name,
          uploadedAt: todayISO,
          reviewedAt: null,
        },
        expiresAt: null,
        source: "demo checklist entry",
      },
    ])
    setFlash(
      `“${pendingName.trim()}” added to the demo checklist with status Submitted. File metadata stays on this page — no upload or transfer occurred.`,
    )
    setPendingName("")
    setPendingType("")
    setPendingFile(null)
  }

  function removeLocalRow(id: string) {
    setLocalRows((current) => current.filter((row) => row.document.id !== id))
    setFlash("Demo checklist row removed from this page's local state.")
  }

  function expiryState(row: DemoDocumentRow): "expired" | "soon" | "ok" | null {
    if (!row.expiresAt) return null
    const days = Math.ceil((new Date(row.expiresAt).getTime() - nowMs) / 86_400_000)
    if (days <= 0) return "expired"
    if (days <= EXPIRY_WARNING_DAYS) return "soon"
    return "ok"
  }

  return (
    <div className={cn("space-y-4", className)}>
      {flash ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CircleCheckBigIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{flash}</span>
        </div>
      ) : null}

      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryTile label="Verified" value={summary.verified} tone="success" />
        <SummaryTile label="In review / submitted" value={summary.pendingReview} tone="warning" />
        <SummaryTile label="Expiring ≤ 90 days" value={summary.expiring} tone="warning" />
        <SummaryTile label="Expired" value={summary.expired} tone="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document checklist</CardTitle>
          <CardDescription>
            Accreditation and legal records for the demo hospital. A document shows as Verified
            only when its admin review status is verified — partner actions here can never set
            that.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-0 px-0 py-0">
          {allRows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={FileTextIcon}
                title="No documents in the demo set"
                description="Accreditation records from the hospital fixture and locally added demo rows appear here."
              />
            </div>
          ) : (
            <ul className="divide-y" aria-label="Document checklist (demo)">
              {allRows.map((row) => {
                const expiry = expiryState(row)
                const isLocal = row.document.id.startsWith("demo-doc-local-")
                return (
                  <li
                    key={row.document.id}
                    className="flex flex-col gap-2 px-(--card-spacing) py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <FileTextIcon
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {row.document.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {DOCUMENT_TYPE_LABELS[row.document.type]} · {row.document.fileLabel} ·
                          uploaded {row.document.uploadedAt}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          {expiry === "expired" ? (
                            <span className="inline-flex items-center gap-1 font-medium text-destructive">
                              <TriangleAlertIcon aria-hidden className="size-3" />
                              Expired {row.expiresAt}
                            </span>
                          ) : expiry === "soon" ? (
                            <span className="inline-flex items-center gap-1 font-medium text-warning">
                              <CircleAlertIcon aria-hidden className="size-3" />
                              Expires {row.expiresAt}
                            </span>
                          ) : expiry === "ok" ? (
                            <span>Valid until {row.expiresAt}</span>
                          ) : (
                            <span>No expiry recorded</span>
                          )}
                          <span aria-hidden>·</span>
                          <span>{row.source}</span>
                        </p>
                        {row.document.reviewerNote ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reviewer note: {row.document.reviewerNote}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                      <StatusBadge status={row.document.status} />
                      {isLocal ? (
                        <ConfirmDialog
                          triggerLabel="Remove"
                          triggerVariant="ghost"
                          triggerSize="xs"
                          destructive
                          title={`Remove “${row.document.name}”?`}
                          description="This removes the locally added demo checklist row from this page only. Nothing was uploaded or stored anywhere."
                          confirmLabel="Remove (demo)"
                          onConfirm={() => removeLocalRow(row.document.id)}
                        />
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Fixture
                        </Badge>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Mock upload / metadata flow */}
      <Card>
        <CardHeader>
          <CardTitle>Add a document (metadata only)</CardTitle>
          <CardDescription>
            Pick a demo file and give it a name and type. The file is never uploaded, stored or
            transmitted — the checklist records its metadata with status “Submitted”, pending a
            demo admin review that never runs.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="doc-name">
                Document name <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-name"
                value={pendingName}
                onChange={(event) => {
                  setPendingName(event.target.value)
                  setFormError(null)
                }}
                placeholder="e.g. Fire safety certificate (demo)"
                aria-invalid={formError && pendingName.trim().length < 4 ? true : undefined}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="doc-type">
                Document type <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Select
                value={pendingType}
                onValueChange={(next) => {
                  setPendingType((next ?? "") as HospitalDocumentType | "")
                  setFormError(null)
                }}
              >
                <SelectTrigger id="doc-type" className="w-full">
                  <SelectValue placeholder="Choose a type…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    {TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[min(var(--radius-md),10px)] border border-border bg-background px-2.5 text-sm font-medium shadow-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <PaperclipIcon aria-hidden className="size-3.5" />
              {pendingFile ? "Choose a different file" : "Choose demo file"}
              <input
                type="file"
                className="sr-only"
                aria-label="Choose a demo file (metadata only, never uploaded)"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  setFormError(null)
                  if (file) {
                    setPendingFile({ name: file.name, size: file.size })
                  }
                }}
              />
            </label>
            {pendingFile ? (
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {pendingFile.name} · {(pendingFile.size / 1024).toFixed(1)} KB (metadata only)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <UploadIcon aria-hidden className="size-3.5" />
                No file selected — uploads are simulated
              </span>
            )}
          </div>

          {formError ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <div>
            <Button type="button" size="sm" onClick={addPendingMetadata}>
              Add to checklist (demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Demo boundary: verification statuses come from fixture/demo data. No partner action in
        this portal can mark a document verified — that state belongs to admin review, which the
        mock phase does not simulate.
      </p>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "success" | "warning" | "danger"
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10">
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p
        className={cn(
          "mt-0.5 text-xs font-medium",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
        )}
      >
        {label}
      </p>
    </div>
  )
}
