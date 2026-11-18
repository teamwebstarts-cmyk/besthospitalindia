"use client"

/**
 * FacilityReviewManager — /admin/facilities (pages/24).
 *
 * Facility administration over the frozen Facility fixtures (all six
 * FacilityCategory values of the existing contract — no new categories
 * invented): search, category/verification filters, review detail drawer,
 * and local mock "record complete / request update" actions.
 *
 * Facilities carry no RatingSummary in the frozen contract (types/provider.ts)
 * — the UI therefore shows no rating columns for facilities and invents none.
 *
 * Layout: DataTable (desktop) / stacked cards (mobile) per pages/24 §8.
 */

import { useMemo, useReducer, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { facilityDetailHref } from "@/constants/routes"
import { formatDateTime } from "@/features/admin/format"
import {
  FACILITY_CATEGORY_LABELS,
  specialtyLabel,
} from "@/features/admin/selectors"
import { required, validate } from "@/lib/validation"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Facility, FacilityCategory, VerificationStatus } from "@/types"

// ---------------------------------------------------------------------------
// Local mock state — never mutates the frozen fixtures
// ---------------------------------------------------------------------------

export interface FacilityChange {
  action: "record_completed" | "update_requested"
  note?: string
  at: string
}

export interface FacilityRecord {
  facility: Facility
  change: FacilityChange | null
}

export interface FacilityManagerState {
  records: FacilityRecord[]
  notice: string | null
}

export type FacilityManagerAction =
  | { type: "mark-complete"; id: string }
  | { type: "request-update"; id: string; note: string }
  | { type: "dismiss-notice" }

function nowIso(): string {
  return new Date().toISOString()
}

export function facilityManagerReducer(
  state: FacilityManagerState,
  action: FacilityManagerAction,
): FacilityManagerState {
  switch (action.type) {
    case "mark-complete":
      return {
        ...state,
        notice: `Demo: facility record "${state.records.find((r) => r.facility.id === action.id)?.facility.name ?? action.id}" marked complete locally. No fixture or public listing changed.`,
        records: state.records.map((record) =>
          record.facility.id === action.id
            ? { ...record, change: { action: "record_completed", at: nowIso() } }
            : record,
        ),
      }
    case "request-update":
      return {
        ...state,
        notice: `Demo: update requested locally for "${state.records.find((r) => r.facility.id === action.id)?.facility.name ?? action.id}". The note stays on this page — no notification exists in this phase.`,
        records: state.records.map((record) =>
          record.facility.id === action.id
            ? { ...record, change: { action: "update_requested", note: action.note, at: nowIso() } }
            : record,
        ),
      }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialFacilityState(facilities: readonly Facility[]): FacilityManagerState {
  return {
    records: facilities.map((facility) => ({ facility, change: null })),
    notice: null,
  }
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "needs_review" | VerificationStatus
type CategoryFilter = "all" | FacilityCategory
type SortKey = "relevance" | "name-asc" | "name-desc" | "category-asc"

const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All facilities" },
  { value: "needs_review", label: "Needs review" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending review" },
  { value: "unverified", label: "Unverified" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
]

const CATEGORY_OPTIONS: ReadonlyArray<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "All categories" },
  ...(Object.keys(FACILITY_CATEGORY_LABELS) as FacilityCategory[]).map((category) => ({
    value: category as CategoryFilter,
    label: FACILITY_CATEGORY_LABELS[category],
  })),
]

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "relevance", label: "Fixture order" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "category-asc", label: "Category (A–Z)" },
]

function matchesFilter(record: FacilityRecord, statusFilter: StatusFilter, category: CategoryFilter): boolean {
  const status = record.facility.verificationStatus
  if (category !== "all" && record.facility.category !== category) return false
  switch (statusFilter) {
    case "all":
      return true
    case "needs_review":
      return status === "pending" || status === "unverified"
    case "verified":
      return status === "verified"
    case "pending":
      return status === "pending"
    case "unverified":
      return status === "unverified"
    case "rejected":
      return status === "rejected"
    case "expired":
      return status === "expired"
    default:
      return true
  }
}

function sortRecords(records: FacilityRecord[], sort: SortKey): FacilityRecord[] {
  const copy = records.slice()
  switch (sort) {
    case "name-asc":
      return copy.sort(
        (a, b) =>
          a.facility.name.localeCompare(b.facility.name) || a.facility.id.localeCompare(b.facility.id),
      )
    case "name-desc":
      return copy.sort(
        (a, b) =>
          b.facility.name.localeCompare(a.facility.name) || a.facility.id.localeCompare(b.facility.id),
      )
    case "category-asc":
      return copy.sort(
        (a, b) =>
          a.facility.category.localeCompare(b.facility.category) ||
          a.facility.id.localeCompare(b.facility.id),
      )
    case "relevance":
    default:
      return copy
  }
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function FacilityDetailDrawer({
  record,
  onClose,
  onMarkComplete,
  onRequestUpdate,
}: {
  record: FacilityRecord | null
  onClose: () => void
  onMarkComplete: (id: string) => void
  onRequestUpdate: (id: string) => void
}) {
  return (
    <Sheet
      open={record !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {record ? (
          <>
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">{record.facility.name}</SheetTitle>
              <SheetDescription className="text-left">
                {FACILITY_CATEGORY_LABELS[record.facility.category]} · {record.facility.city},{" "}
                {record.facility.state} · {record.facility.id}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 p-4">
              <section aria-label="Verification state" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Verification state</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Record verification</span>
                  <VerificationBadge status={record.facility.verificationStatus} />
                </div>
                {record.change ? (
                  <div className="rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-xs text-info">
                    {record.change.action.replace(/_/g, " ")}
                    {record.change.note ? ` — ${record.change.note}` : ""} ·{" "}
                    {formatDateTime(record.change.at)}
                  </div>
                ) : null}
              </section>

              <Separator />

              <section aria-label="Specialties" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Specialties</h3>
                {record.facility.specialties.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                    No specialties listed on this demo facility.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {record.facility.specialties.map((specialtyId) => (
                      <li
                        key={specialtyId}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {specialtyLabel(specialtyId)}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section aria-label="Services" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Services</h3>
                {record.facility.services.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                    No services listed on this demo facility.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {record.facility.services.map((service) => (
                      <li key={service} className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                        />
                        {service}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section aria-label="Actions" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onMarkComplete(record.facility.id)}>
                    Mark complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRequestUpdate(record.facility.id)}
                  >
                    Request update…
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={facilityDetailHref(record.facility.slug)} />}
                  >
                    View public page
                  </Button>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface FacilityReviewManagerProps {
  facilities: readonly Facility[]
  className?: string
}

export function FacilityReviewManager({ facilities, className }: FacilityReviewManagerProps) {
  const [state, dispatch] = useReducer(facilityManagerReducer, facilities, makeInitialFacilityState)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [sort, setSort] = useState<SortKey>("relevance")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [updateId, setUpdateId] = useState<string | null>(null)
  const [updateNote, setUpdateNote] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = state.records.filter((record) => {
      if (!matchesFilter(record, statusFilter, categoryFilter)) return false
      if (tokens.length === 0) return true
      const haystack = [
        record.facility.name,
        record.facility.city,
        record.facility.state,
        FACILITY_CATEGORY_LABELS[record.facility.category],
        ...record.facility.services,
      ]
        .join(" ")
        .toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
    return sortRecords(filtered, sort)
  }, [state.records, query, statusFilter, categoryFilter, sort])

  const detailRecord = detailId
    ? (state.records.find((record) => record.facility.id === detailId) ?? null)
    : null
  const updateRecord = updateId
    ? (state.records.find((record) => record.facility.id === updateId) ?? null)
    : null

  function openUpdate(id: string) {
    setUpdateNote("")
    setUpdateError(null)
    setUpdateId(id)
  }

  function confirmUpdate() {
    if (!updateId) return
    const errors = validate({ note: [required("Update request note")] }, { note: updateNote })
    if (errors.note) {
      setUpdateError(errors.note)
      return
    }
    dispatch({ type: "request-update", id: updateId, note: updateNote.trim() })
    setUpdateId(null)
  }

  const columns: Array<DataTableColumn<FacilityRecord>> = [
    {
      key: "name",
      header: "Facility",
      render: (record) => (
        <div className="min-w-0 space-y-0.5">
          <button
            type="button"
            onClick={() => setDetailId(record.facility.id)}
            className="truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {record.facility.name}
          </button>
          <p className="truncate text-xs text-muted-foreground">
            {record.facility.city}, {record.facility.state}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (record) => FACILITY_CATEGORY_LABELS[record.facility.category],
    },
    {
      key: "verification",
      header: "Verification",
      render: (record) => (
        <div className="space-y-1">
          <VerificationBadge status={record.facility.verificationStatus} />
          {record.change ? (
            <p className="text-xs text-info">
              {record.change.action.replace(/_/g, " ")} locally {formatDateTime(record.change.at)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "services",
      header: "Services",
      render: (record) => (
        <span className="tabular-nums">{record.facility.services.length}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (record) => (
        <div className="flex justify-end gap-1.5">
          <Button size="xs" variant="outline" onClick={() => setDetailId(record.facility.id)}>
            Review
          </Button>
          {record.change === null ? (
            <Button
              size="xs"
              onClick={() => dispatch({ type: "mark-complete", id: record.facility.id })}
            >
              Complete
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Updated</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor="facility-search">Search</Label>
            <Input
              id="facility-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, city, category or service…"
              type="search"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facility-category-filter">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                if (typeof value === "string") setCategoryFilter(value as CategoryFilter)
              }}
            >
              <SelectTrigger id="facility-category-filter" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facility-status-filter">Verification</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (typeof value === "string") setStatusFilter(value as StatusFilter)
              }}
            >
              <SelectTrigger id="facility-status-filter" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facility-sort">Sort</Label>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (typeof value === "string") setSort(value as SortKey)
              }}
            >
              <SelectTrigger id="facility-sort" className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground xl:pb-2">
          {visible.length} of {state.records.length} facilities
        </p>
      </div>

      {state.notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          <span>{state.notice}</span>
          <Button variant="ghost" size="xs" onClick={() => dispatch({ type: "dismiss-notice" })}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title="No facilities match these filters"
          description="Try clearing the search or resetting the category and verification filters."
          action={{
            label: "Show all facilities",
            onClick: () => {
              setQuery("")
              setStatusFilter("all")
              setCategoryFilter("all")
            },
          }}
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              rows={visible}
              getRowKey={(record) => record.facility.id}
              emptyMessage="No facilities to show."
            />
          </div>

          <ul className="space-y-3 sm:hidden" aria-label="Facilities">
            {visible.map((record) => (
              <li key={record.facility.id} className="rounded-lg border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{record.facility.name}</p>
                    <VerificationBadge status={record.facility.verificationStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {FACILITY_CATEGORY_LABELS[record.facility.category]} · {record.facility.city},{" "}
                    {record.facility.state}
                  </p>
                  {record.change ? (
                    <p className="text-xs text-info">
                      {record.change.action.replace(/_/g, " ")} locally{" "}
                      {formatDateTime(record.change.at)}
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(record.facility.id)}>
                    Review
                  </Button>
                  {record.change === null ? (
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "mark-complete", id: record.facility.id })}
                    >
                      Complete
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <FacilityDetailDrawer
        record={detailRecord}
        onClose={() => setDetailId(null)}
        onMarkComplete={(id) => dispatch({ type: "mark-complete", id })}
        onRequestUpdate={(id) => openUpdate(id)}
      />

      {/* Request-update dialog */}
      <Dialog
        open={updateId !== null}
        onOpenChange={(open) => {
          if (!open) setUpdateId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request update</DialogTitle>
            <DialogDescription>
              {updateRecord ? `${updateRecord.facility.name} — local demo only.` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="facility-update-note">
              Note <span aria-hidden className="text-destructive"> *</span>
            </Label>
            <Textarea
              id="facility-update-note"
              value={updateNote}
              onChange={(event) => {
                setUpdateNote(event.target.value)
                setUpdateError(null)
              }}
              rows={3}
              placeholder="e.g. Services list incomplete — request the full catalogue (demo note)"
              aria-invalid={updateError ? true : undefined}
              aria-describedby={updateError ? "facility-update-note-error" : undefined}
            />
            {updateError ? (
              <p id="facility-update-note-error" className="text-xs font-medium text-destructive">
                {updateError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateId(null)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdate}>Request update (demo)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
