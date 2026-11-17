"use client"

/**
 * EvidenceSubmitMock — demo evidence placeholder submission (pages/54).
 *
 * The partner can record that evidence exists (label + kind + note). The
 * submission is stored in local component state with status "submitted" and
 * explicitly never published, never scored, and never attached to an
 * assessment. There is deliberately NO publish control — publication is an
 * admin authority and the demo does not simulate it.
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
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CircleCheckBigIcon, ShieldQuestionIcon } from "lucide-react"
import type { RatingEvidenceKind } from "@/types"

export interface EvidenceSubmitMockProps {
  hospitalId: string
  className?: string
}

const EVIDENCE_KIND_LABELS: Record<RatingEvidenceKind, string> = {
  patient_feedback_sample: "Patient feedback sample",
  clinical_audit: "Clinical audit",
  accreditation_record: "Accreditation record",
  credential_check: "Credential check",
  outcome_report: "Outcome report",
  other: "Other",
}

const KIND_OPTIONS = Object.keys(EVIDENCE_KIND_LABELS) as RatingEvidenceKind[]

interface LocalEvidence {
  id: string
  label: string
  kind: RatingEvidenceKind
  note: string
  submittedAt: string
}

const DEMO_TODAY = "2026-11-17"

export function EvidenceSubmitMock({ hospitalId, className }: EvidenceSubmitMockProps) {
  const [items, setItems] = React.useState<LocalEvidence[]>([])
  const [label, setLabel] = React.useState("")
  const [kind, setKind] = React.useState<RatingEvidenceKind | "">("")
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [flash, setFlash] = React.useState<string | null>(null)

  function submit() {
    setError(null)
    setFlash(null)
    if (label.trim().length < 4) {
      setError("Describe the evidence in at least 4 characters.")
      return
    }
    if (!kind) {
      setError("Choose an evidence kind from the demo list.")
      return
    }

    const entry: LocalEvidence = {
      id: `demo-evidence-${Date.now()}`,
      label: label.trim(),
      kind,
      note: note.trim(),
      submittedAt: DEMO_TODAY,
    }
    setItems((current) => [entry, ...current])
    setFlash(
      "Evidence placeholder recorded for the demo hospital. It stays “Submitted” — it is never published, scored or attached to an assessment.",
    )
    setLabel("")
    setKind("")
    setNote("")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Evidence submission (demo)</CardTitle>
          <Badge variant="outline" className="ring-1 ring-inset ring-info/30 bg-info/10 text-info">
            <ShieldQuestionIcon aria-hidden className="size-3" />
            No self-publish
          </Badge>
        </div>
        <CardDescription>
          Record that supporting evidence exists for an assessment. Submissions stay local to this
          demo page with status “Submitted”; only platform admin can review, score or publish
          evidence — that flow is not simulated here.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="evidence-label">
              Evidence description <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="evidence-label"
              value={label}
              onChange={(event) => {
                setLabel(event.target.value)
                setError(null)
              }}
              placeholder="e.g. Q3 infection-rate audit summary (demo)"
              aria-invalid={Boolean(error) && label.trim().length < 4 ? true : undefined}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="evidence-kind">
              Evidence kind <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Select
              value={kind}
              onValueChange={(next) => {
                setKind((next ?? "") as RatingEvidenceKind | "")
                setError(null)
              }}
            >
              <SelectTrigger id="evidence-kind" className="w-full">
                <SelectValue placeholder="Choose a kind…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kind</SelectLabel>
                  {KIND_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {EVIDENCE_KIND_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="evidence-note">Note (optional)</Label>
          <Input
            id="evidence-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Context for the demo admin reviewer"
          />
        </div>

        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
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

        <div>
          <Button type="button" size="sm" onClick={submit}>
            Submit evidence placeholder (demo)
          </Button>
        </div>

        {items.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-foreground">
              Submitted in this session ({items.length})
            </p>
            <ul className="mt-2 space-y-2 text-sm" aria-label="Locally submitted evidence placeholders">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {EVIDENCE_KIND_LABELS[item.kind]}
                      {item.note ? ` · ${item.note}` : ""} · submitted {item.submittedAt} ·
                      hospital {hospitalId}
                    </span>
                  </span>
                  <StatusBadge status="submitted" label="Submitted" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
