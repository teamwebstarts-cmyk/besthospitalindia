"use client"

/**
 * ConsultationsClient — /doctor-portal/consultations (pages/62).
 *
 * Doctor-directed consultation queue (PatientEnquiry fixtures where
 * preferredProviderId = demo doctor). Interactions per spec: open a case
 * (detail drawer/sheet), update the next-step response status, request more
 * information — all local mock state.
 *
 * Trust rule honored: reportNames render as metadata labels only. Whether the
 * demo doctor may see a report is a fixture permission this phase does not
 * model, so the drawer states that access is not granted rather than showing
 * report contents ("Medical reports are not exposed unless access fixture
 * permits").
 */

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Separator } from "@/components/ui/separator"
import {
  formatDate,
  formatDateTime,
} from "@/features/doctor-portal/format"
import { specialtyLabel } from "@/features/doctor-portal/selectors"
import { cn } from "@/lib/utils"
import type { PatientEnquiry } from "@/types"

// ---------------------------------------------------------------------------
// Local response state (mock only)
// ---------------------------------------------------------------------------

/** PROPOSED local vocabulary — "what the doctor did with this enquiry". The
 * fixture PatientEnquiryStatus stays untouched; responses layer on top. */
export type ConsultationResponse = "awaiting" | "info_requested" | "advised" | "declined"

export const RESPONSE_LABELS: Record<ConsultationResponse, string> = {
  awaiting: "Awaiting response",
  info_requested: "More information requested",
  advised: "Next-step advice recorded",
  declined: "Declined (out of scope)",
}

export interface ConsultationCase {
  enquiry: PatientEnquiry
  response: ConsultationResponse
  note: string
  updatedAt: string | null
}

export interface ConsultationsClientState {
  cases: ConsultationCase[]
  notice: string | null
}

export type ConsultationsAction =
  | { type: "update"; enquiryId: string; response: ConsultationResponse; note: string }
  | { type: "dismiss-notice" }

export function consultationsReducer(
  state: ConsultationsClientState,
  action: ConsultationsAction,
): ConsultationsClientState {
  switch (action.type) {
    case "update": {
      const label = RESPONSE_LABELS[action.response]
      const noteSuffix = action.note.trim() === "" ? "" : " — note recorded locally"
      return {
        ...state,
        notice: `Demo enquiry ${action.enquiryId} updated locally to “${label}”${noteSuffix}. Nothing was sent to the patient.`,
        cases: state.cases.map((entry) =>
          entry.enquiry.id === action.enquiryId
            ? {
                ...entry,
                response: action.response,
                note: action.note.trim(),
                updatedAt: new Date().toISOString(),
              }
            : entry,
        ),
      }
    }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialConsultationsState(
  enquiries: readonly PatientEnquiry[],
): ConsultationsClientState {
  return {
    cases: enquiries.map((enquiry) => ({
      enquiry,
      response: "awaiting",
      note: "",
      updatedAt: null,
    })),
    notice: null,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ConsultationsClientProps {
  enquiries: readonly PatientEnquiry[]
  className?: string
}

const RESPONSE_OPTIONS: ReadonlyArray<ConsultationResponse> = [
  "awaiting",
  "info_requested",
  "advised",
  "declined",
]

export function ConsultationsClient({ enquiries, className }: ConsultationsClientProps) {
  const [state, setState] = useState(() => makeInitialConsultationsState(enquiries))
  const [openId, setOpenId] = useState<string | null>(null)
  const [draftResponse, setDraftResponse] = useState<ConsultationResponse>("awaiting")
  const [draftNote, setDraftNote] = useState("")
  const [noteError, setNoteError] = useState<string | null>(null)

  const openCase = useMemo(
    () => state.cases.find((entry) => entry.enquiry.id === openId) ?? null,
    [state.cases, openId],
  )

  function openDrawer(entry: ConsultationCase) {
    setOpenId(entry.enquiry.id)
    setDraftResponse(entry.response)
    setDraftNote(entry.note)
    setNoteError(null)
  }

  function applyUpdate() {
    if (!openCase) return
    if (draftResponse !== "awaiting" && draftResponse !== "declined" && draftNote.trim() === "") {
      setNoteError(
        draftResponse === "info_requested"
          ? "List the information or reports you need before sending."
          : "Record the next-step advice before sending.",
      )
      return
    }
    setState((previous) =>
      consultationsReducer(previous, {
        type: "update",
        enquiryId: openCase.enquiry.id,
        response: draftResponse,
        note: draftNote,
      }),
    )
    setOpenId(null)
  }

  function dispatchDismiss() {
    setState((previous) => consultationsReducer(previous, { type: "dismiss-notice" }))
  }

  const openCount = state.cases.filter((entry) => entry.response === "awaiting").length

  return (
    <div className={cn("space-y-4", className)}>
      {state.notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          <span>{state.notice}</span>
          <Button variant="ghost" size="xs" onClick={dispatchDismiss}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {state.cases.length === 0 ? (
        <EmptyState
          title="No consultations assigned to the demo profile"
          description="When the demo coordination desk assigns an enquiry to this doctor profile it appears here with response controls."
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2" aria-label="Assigned consultation cases">
          {state.cases.map((entry) => (
            <li key={entry.enquiry.id}>
              <Card size="sm" className="h-full">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="min-w-0 truncate">
                      {entry.enquiry.patientName}
                    </CardTitle>
                    <StatusBadge status={entry.enquiry.status} />
                  </div>
                  <CardDescription>
                    {entry.enquiry.id} · {specialtyLabel(entry.enquiry.specialty)} ·{" "}
                    {entry.enquiry.country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="gap-3">
                  <p className="text-sm text-foreground">{entry.enquiry.concern}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.enquiry.reportNames.length > 0 ? (
                      entry.enquiry.reportNames.map((reportName) => (
                        <Badge key={reportName} variant="outline" className="text-muted-foreground">
                          {reportName}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        No reports attached
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Response: {RESPONSE_LABELS[entry.response]}</p>
                    <p>Preferred date: {formatDate(entry.enquiry.preferredDate, "not stated")}</p>
                    <p>Consent captured: {formatDateTime(entry.enquiry.consentAt)}</p>
                    {entry.updatedAt ? <p>Updated locally: {formatDateTime(entry.updatedAt)}</p> : null}
                    {entry.note ? <p className="text-foreground">Note: {entry.note}</p> : null}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openDrawer(entry)} className="self-start">
                    Open case
                    <span className="sr-only"> — {entry.enquiry.patientName}</span>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {openCount > 0 ? (
        <p className="text-xs text-muted-foreground">{openCount} case(s) awaiting your first response.</p>
      ) : null}

      {/* Case detail drawer */}
      <Sheet
        open={openCase !== null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null)
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
          {openCase ? (
            <>
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left">{openCase.enquiry.patientName}</SheetTitle>
                <SheetDescription className="text-left">
                  {openCase.enquiry.id} · {specialtyLabel(openCase.enquiry.specialty)} ·{" "}
                  {openCase.enquiry.country}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                <section aria-label="Enquiry details" className="space-y-2 text-sm">
                  <p className="text-foreground">{openCase.enquiry.concern}</p>
                  <dl className="grid gap-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-3">
                      <dt>Preferred language</dt>
                      <dd className="text-foreground">{openCase.enquiry.preferredLanguage}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Preferred date</dt>
                      <dd className="text-foreground">
                        {formatDate(openCase.enquiry.preferredDate, "not stated")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Consent captured</dt>
                      <dd className="text-foreground">{formatDateTime(openCase.enquiry.consentAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Enquiry status (fixture)</dt>
                      <dd>
                        <StatusBadge status={openCase.enquiry.status} />
                      </dd>
                    </div>
                  </dl>
                </section>

                <section aria-label="Attached reports" className="space-y-2">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Medical reports
                  </p>
                  {openCase.enquiry.reportNames.length > 0 ? (
                    <ul className="space-y-1.5">
                      {openCase.enquiry.reportNames.map((reportName) => (
                        <li
                          key={reportName}
                          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="min-w-0 truncate">{reportName}</span>
                          <Badge variant="outline" className="shrink-0 text-muted-foreground">
                            Access not granted
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reports attached to this enquiry.</p>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Report contents are not exposed in this demo: no fixture grants report
                    access to the doctor role, so only file labels are visible. Use “request
                    more information” to ask the desk for specific documents.
                  </p>
                </section>

                <section aria-label="Update response" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="consultation-response">Next-step status</Label>
                    <Select
                      value={draftResponse}
                      onValueChange={(value) => {
                        if (typeof value === "string") {
                          setDraftResponse(value as ConsultationResponse)
                          setNoteError(null)
                        }
                      }}
                    >
                      <SelectTrigger id="consultation-response" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESPONSE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {RESPONSE_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="consultation-note">
                      Note{" "}
                      {draftResponse !== "awaiting" && draftResponse !== "declined" ? (
                        <span aria-hidden className="text-destructive">
                          *
                        </span>
                      ) : (
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      )}
                    </Label>
                    <Textarea
                      id="consultation-note"
                      rows={4}
                      value={draftNote}
                      onChange={(event) => {
                        setDraftNote(event.target.value)
                        setNoteError(null)
                      }}
                      placeholder={
                        draftResponse === "info_requested"
                          ? "e.g. Please attach the latest spirometry report (demo)."
                          : draftResponse === "advised"
                            ? "e.g. Recommend an in-person review at the next availability window (demo)."
                            : "Optional context kept in this page's local state."
                      }
                      aria-invalid={noteError ? true : undefined}
                      aria-describedby={noteError ? "consultation-note-error" : undefined}
                    />
                    {noteError ? (
                      <p id="consultation-note-error" className="text-xs font-medium text-destructive">
                        {noteError}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={applyUpdate}>Save response (demo)</Button>
                    <Button variant="outline" onClick={() => setOpenId(null)}>
                      Close
                    </Button>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Demo boundary: responses and notes stay in this page’s local state. No
                    message reaches the patient, the desk or any backend.
                  </p>
                </section>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
