"use client"

/**
 * EnquiryQueueManager — patient enquiries (pages/51).
 *
 * Filter + detail drawer (Sheet: full-screen on mobile) + local status
 * updates + demo internal-owner assignment over the scoped enquiry queue.
 *
 * Privacy boundary (spec: "Patient fields privacy-limited; mock assignment
 * only"): the drawer shows the enquiry's own consented fields (name, country,
 * language, specialty, concern, report names, preferred date) — the email and
 * phone are masked to the partner (demo rule: contact handover happens only
 * after the platform assigns the case, which the demo does not simulate).
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { specialtyById } from "@/data"
import type { PatientEnquiry } from "@/types"
import { CircleCheckBigIcon, EyeIcon, MessagesSquareIcon, PaperclipIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EnquiryQueueManagerProps {
  enquiries: readonly PatientEnquiry[]
  /** Demo team members eligible as internal owners (owner/staff only). */
  teamMembers: ReadonlyArray<{ id: string; name: string; role: string }>
  /** Deep-linked enquiry id from the dashboard queue, if any. */
  initialEnquiryKey?: string
  className?: string
}

type StatusFilter = "all" | PatientEnquiry["status"]

/** Demo-only masking for partner-visible contact fields. */
function maskContact(value: string): string {
  const [localPart, domainPart] = value.split("@")
  if (domainPart) {
    const visible = localPart.slice(0, 2)
    return `${visible}${"•".repeat(Math.max(localPart.length - 2, 2))}@${domainPart}`
  }
  const digits = value.replace(/\D/g, "")
  return `${value.slice(0, Math.max(value.length - 4 - digits.length.toString().length, 3))} •••• ${digits.slice(-2)}`
}

export function EnquiryQueueManager({
  enquiries,
  teamMembers,
  initialEnquiryKey,
  className,
}: EnquiryQueueManagerProps) {
  const [statusById, setStatusById] = React.useState<Record<string, PatientEnquiry["status"]>>(() =>
    Object.fromEntries(enquiries.map((enquiry) => [enquiry.id, enquiry.status])),
  )
  const [ownerById, setOwnerById] = React.useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)
  // Deep-linked enquiry (from a dashboard queue) opens the sheet once at
  // mount — resolved in lazy initializers, no effect needed.
  const [activeEnquiry, setActiveEnquiry] = React.useState<PatientEnquiry | null>(() =>
    initialEnquiryKey
      ? (enquiries.find((enquiry) => enquiry.id === initialEnquiryKey) ?? null)
      : null,
  )
  const [sheetOpen, setSheetOpen] = React.useState(
    () =>
      Boolean(initialEnquiryKey) &&
      enquiries.some((enquiry) => enquiry.id === initialEnquiryKey),
  )

  const eligibleOwners = teamMembers.filter(
    (member) => member.role === "owner" || member.role === "staff",
  )

  const filtered = React.useMemo(() => {
    if (statusFilter === "all") return enquiries
    return enquiries.filter((enquiry) => (statusById[enquiry.id] ?? enquiry.status) === statusFilter)
  }, [enquiries, statusFilter, statusById])

  function updateStatus(enquiry: PatientEnquiry, status: PatientEnquiry["status"]) {
    setStatusById((current) => ({ ...current, [enquiry.id]: status }))
    setFlash(
      `Enquiry ${enquiry.id} marked “${status.replace(/_/g, " ")}” locally. No patient was contacted — this is a demo state change.`,
    )
  }

  function assignOwner(enquiry: PatientEnquiry, memberId: string) {
    setOwnerById((current) => ({ ...current, [enquiry.id]: memberId }))
    const member = eligibleOwners.find((candidate) => candidate.id === memberId)
    setFlash(
      `Enquiry ${enquiry.id} assigned to ${member?.name ?? "demo owner"} internally (demo assignment only — no notification was sent).`,
    )
  }

  const columns: Array<DataTableColumn<PatientEnquiry>> = [
    {
      key: "id",
      header: "Enquiry",
      render: (enquiry) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">
            {enquiry.patientName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {enquiry.id} · {specialtyById[enquiry.specialty]?.name ?? enquiry.specialty}
          </span>
        </span>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (enquiry) => enquiry.country,
    },
    {
      key: "preferredDate",
      header: "Preferred date",
      render: (enquiry) => enquiry.preferredDate ?? "—",
    },
    {
      key: "status",
      header: "Status",
      render: (enquiry) => <StatusBadge status={statusById[enquiry.id] ?? enquiry.status} />,
    },
    {
      key: "owner",
      header: "Internal owner",
      render: (enquiry) => {
        const ownerId = ownerById[enquiry.id]
        if (!ownerId) return <span className="text-muted-foreground">Unassigned</span>
        return (
          <span className="font-medium text-foreground">
            {eligibleOwners.find((member) => member.id === ownerId)?.name ?? ownerId}
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (enquiry) => (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setActiveEnquiry(enquiry)
            setSheetOpen(true)
          }}
          aria-label={`Open enquiry ${enquiry.id} from ${enquiry.patientName}`}
        >
          <EyeIcon data-icon="inline-start" />
          Open
        </Button>
      ),
    },
  ]

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "All statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under review" },
    { value: "assigned", label: "Assigned" },
    { value: "responded", label: "Responded" },
    { value: "closed", label: "Closed" },
  ]

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

      <Card>
        <CardHeader>
          <CardTitle>Patient enquiries</CardTitle>
          <CardDescription>
            Enquiries addressed to the demo hospital or open enquiries in its listed specialties.
            Open a row to see privacy-limited patient details and update local progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}
            >
              <SelectTrigger aria-label="Filter by status" className="w-full sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              Showing {filtered.length} of {enquiries.length} demo enquiries.
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={[...filtered]}
            getRowKey={(row) => row.id}
            emptyMessage="No enquiries match the demo filters."
            emptyIcon={MessagesSquareIcon}
          />
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto sm:max-w-lg"
          aria-describedby="enquiry-sheet-desc"
        >
          {activeEnquiry ? (
            <>
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left">
                  Enquiry {activeEnquiry.id}
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    {activeEnquiry.patientName} · {specialtyById[activeEnquiry.specialty]?.name ?? activeEnquiry.specialty}
                  </span>
                </SheetTitle>
                <SheetDescription id="enquiry-sheet-desc" className="text-left">
                  Consent captured {formatDateTime(activeEnquiry.consentAt)}. Patient contact
                  details stay masked to partners in the demo until platform assignment.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 p-4">
                <section aria-label="Patient details" className="rounded-lg border p-3 text-sm">
                  <dl className="grid gap-2">
                    <Row label="Name" value={activeEnquiry.patientName} />
                    <Row
                      label="Email (masked)"
                      value={maskContact(activeEnquiry.email)}
                      mono
                    />
                    <Row label="Phone (masked)" value={maskContact(activeEnquiry.phone)} mono />
                    <Row label="Country" value={activeEnquiry.country} />
                    <Row label="Language" value={activeEnquiry.preferredLanguage} />
                    <Row
                      label="Specialty"
                      value={specialtyById[activeEnquiry.specialty]?.name ?? activeEnquiry.specialty}
                    />
                    <Row
                      label="Preferred provider"
                      value={
                        activeEnquiry.preferredProviderId
                          ? activeEnquiry.preferredProviderId === "hosp-sunrise-delhi"
                            ? "This hospital (demo)"
                            : activeEnquiry.preferredProviderId
                          : "No preference"
                      }
                    />
                    <Row
                      label="Preferred date"
                      value={activeEnquiry.preferredDate ?? "Not stated"}
                    />
                  </dl>
                </section>

                <section aria-label="Concern" className="text-sm">
                  <p className="font-medium text-foreground">Stated concern</p>
                  <p className="mt-1 rounded-lg border bg-muted/40 p-3 text-muted-foreground">
                    {activeEnquiry.concern}
                  </p>
                </section>

                <section aria-label="Attached reports" className="text-sm">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <PaperclipIcon aria-hidden className="size-3.5" />
                    Referenced reports ({activeEnquiry.reportNames.length})
                  </p>
                  {activeEnquiry.reportNames.length === 0 ? (
                    <p className="mt-1 text-muted-foreground">No report names in the demo record.</p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {activeEnquiry.reportNames.map((name) => (
                        <li
                          key={name}
                          className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2"
                        >
                          <span className="truncate font-mono text-xs text-foreground">{name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">metadata only</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Report contents are never displayed to partners in the demo — file metadata
                    only.
                  </p>
                </section>

                <Separator />

                <section aria-label="Local progress" className="space-y-3 text-sm">
                  <p className="font-medium text-foreground">Local progress (demo)</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label
                        htmlFor="enquiry-status"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Status
                      </label>
                      <Select
                        value={statusById[activeEnquiry.id] ?? activeEnquiry.status}
                        onValueChange={(next) =>
                          updateStatus(activeEnquiry, (next ?? activeEnquiry.status) as PatientEnquiry["status"])
                        }
                      >
                        <SelectTrigger id="enquiry-status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {statusOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <label
                        htmlFor="enquiry-owner"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Internal owner (demo)
                      </label>
                      <Select
                        value={ownerById[activeEnquiry.id] ?? ""}
                        onValueChange={(next) => {
                          if (next) assignOwner(activeEnquiry, next)
                        }}
                      >
                        <SelectTrigger id="enquiry-owner" className="w-full">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {eligibleOwners.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} ({member.role})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demo assignment only — the selected owner is recorded on this
                    page&apos;s local state; no email, push or SMS notification is sent.
                  </p>
                </section>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <p className="text-xs text-muted-foreground">
        Demo boundary: statuses and internal owners update local state only. Contact handover and
        patient messaging are future platform features the demo does not simulate.
      </p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium text-foreground", mono && "font-mono text-xs")}>
        {value}
      </dd>
    </div>
  )
}

function formatDateTime(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}
