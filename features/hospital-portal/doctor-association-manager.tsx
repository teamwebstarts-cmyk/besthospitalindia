"use client"

/**
 * DoctorAssociationManager — doctor management (pages/49).
 *
 * Two demo queues over the FROZEN doctor fixtures:
 * - "Associated doctors" — doctors whose fixture `hospitalIds` include the
 *   demo hospital. Removing one updates LOCAL state only and marks it
 *   "pending admin review"; the change is never persisted anywhere.
 * - "Directory search" — pure searchDoctors over all fixtures (name,
 *   specialization, city), excluding currently associated doctors. Requesting
 *   an association records a local pending request.
 *
 * Removal uses the shared ConfirmDialog; requested associations are labelled
 * demo-pending. Search/filter/sort operate on the displayed fixture set, not
 * just control appearance.
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { specialtyById } from "@/data"
import { searchDoctors } from "@/lib/search"
import type { Doctor } from "@/types"
import { CircleCheckBigIcon, SearchIcon, StethoscopeIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DoctorAssociationManagerProps {
  hospitalId: string
  /** Doctors whose fixture hospitalIds include the demo hospital. */
  associatedDoctors: readonly Doctor[]
  /** All doctor fixtures (for the directory search pool). */
  allDoctors: readonly Doctor[]
  className?: string
}

interface RequestedAssociation {
  doctorId: string
  requestedAt: string
}

export function DoctorAssociationManager({
  hospitalId,
  associatedDoctors,
  allDoctors,
  className,
}: DoctorAssociationManagerProps) {
  // Local demo state: association set + pending requests (never persisted).
  // Removals are tracked in `removals`; the setter for this list is unused.
  const [associatedIds] = React.useState<string[]>(() =>
    associatedDoctors.map((doctor) => doctor.id),
  )
  const [requests, setRequests] = React.useState<Record<string, RequestedAssociation>>({})
  const [removals, setRemovals] = React.useState<Record<string, true>>({})

  const [query, setQuery] = React.useState("")
  const [specialization, setSpecialization] = React.useState("all")
  const [city, setCity] = React.useState("all")

  const doctorById = React.useMemo(
    () => new Map(allDoctors.map((doctor) => [doctor.id, doctor])),
    [allDoctors],
  )

  // --- Associated table (fixture-derived, minus local removals) -----------

  const associatedRows = React.useMemo(
    () => associatedIds.filter((id) => !removals[id]).map((id) => doctorById.get(id)),
    [associatedIds, removals, doctorById],
  )

  // --- Directory search (pure selector over the fixture pool) -------------

  const searchPool = React.useMemo(
    () =>
      allDoctors.filter(
        (doctor) => !associatedIds.includes(doctor.id) || removals[doctor.id],
      ),
    [allDoctors, associatedIds, removals],
  )

  const results = React.useMemo(() => {
    return searchDoctors(
      {
        query: query.trim() || undefined,
        specialization: specialization === "all" ? undefined : specialization,
        city: city === "all" ? undefined : city,
      },
      undefined,
      "name-asc",
    ).filter((doctor) => searchPool.some((poolEntry) => poolEntry.id === doctor.id))
  }, [query, specialization, city, searchPool])

  // Facet options derived from fixtures.
  const specializationOptions = React.useMemo(() => {
    const ids = new Set(allDoctors.map((doctor) => doctor.specialization))
    return [...ids].sort()
  }, [allDoctors])
  const cityOptions = React.useMemo(() => {
    const cities = new Set(allDoctors.map((doctor) => doctor.city))
    return [...cities].sort((a, b) => a.localeCompare(b))
  }, [allDoctors])

  const requestedIds = new Set(Object.keys(requests))

  function requestAssociation(doctor: Doctor) {
    setRequests((current) => ({
      ...current,
      [doctor.id]: { doctorId: doctor.id, requestedAt: new Date().toISOString() },
    }))
  }

  function cancelAssociationRequest(doctorId: string) {
    setRequests((current) => {
      const next = { ...current }
      delete next[doctorId]
      return next
    })
  }

  function removeAssociation(doctor: Doctor) {
    setRemovals((current) => ({ ...current, [doctor.id]: true }))
  }

  const associatedColumns: Array<DataTableColumn<Doctor>> = [
    {
      key: "name",
      header: "Doctor",
      render: (doctor) => (
        <span className="flex items-center gap-2.5">
          <Avatar size="sm">
            {doctor.photo ? <AvatarImage src={doctor.photo} alt="" /> : null}
            <AvatarFallback aria-hidden>{initialsOf(doctor.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">{doctor.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {specialtyById[doctor.specialization]?.name ?? doctor.specialization} · {doctor.city}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "verificationStatus",
      header: "Verification",
      render: (doctor) => <VerificationBadge status={doctor.verificationStatus} />,
    },
    {
      key: "experience",
      header: "Experience",
      render: (doctor) =>
        doctor.yearsExperience === null ? "Not stated (demo)" : `${doctor.yearsExperience} yrs`,
    },
    {
      key: "status",
      header: "Association",
      render: () => <StatusBadge status="approved" label="Active (demo)" />,
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (doctor) => (
        <ConfirmDialog
          triggerLabel="Remove"
          triggerVariant="outline"
          triggerSize="xs"
          destructive
          title={`Remove ${doctor.name}?`}
          description="This removes the association in the demo session only and marks it as pending admin review. Nothing is changed anywhere else — the public profile keeps the doctor until a real review happens."
          confirmLabel="Remove association (demo)"
          onConfirm={() => removeAssociation(doctor)}
        />
      ),
    },
  ]

  const resultColumns: Array<DataTableColumn<Doctor>> = [
    {
      key: "name",
      header: "Doctor",
      render: (doctor) => (
        <span className="flex items-center gap-2.5">
          <Avatar size="sm">
            {doctor.photo ? <AvatarImage src={doctor.photo} alt="" /> : null}
            <AvatarFallback aria-hidden>{initialsOf(doctor.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">{doctor.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {specialtyById[doctor.specialization]?.name ?? doctor.specialization} · {doctor.city}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "verificationStatus",
      header: "Verification",
      render: (doctor) => <VerificationBadge status={doctor.verificationStatus} />,
    },
    {
      key: "state",
      header: "Status",
      render: (doctor) => {
        if (requestedIds.has(doctor.id)) {
          return <StatusBadge status="pending" label="Requested (demo)" />
        }
        if (removals[doctor.id]) {
          return <StatusBadge status="pending" label="Removal pending (demo)" />
        }
        return <StatusBadge status="inactive" label="Not associated" />
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (doctor) => {
        if (requestedIds.has(doctor.id)) {
          return (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => cancelAssociationRequest(doctor.id)}
              aria-label={`Cancel association request for ${doctor.name}`}
            >
              <XIcon data-icon="inline-start" />
              Cancel request
            </Button>
          )
        }
        return (
          <Button
            variant="outline"
            size="xs"
            onClick={() => requestAssociation(doctor)}
            aria-label={`Request association with ${doctor.name}`}
          >
            Request association
          </Button>
        )
      },
    },
  ]

  const pendingRequestCount = Object.keys(requests).length
  const pendingRemovalCount = Object.keys(removals).length

  return (
    <div className={cn("space-y-4", className)}>
      {pendingRequestCount + pendingRemovalCount > 0 ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
        >
          <CircleCheckBigIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            Demo association changes recorded: {pendingRequestCount} request
            {pendingRequestCount === 1 ? "" : "s"}, {pendingRemovalCount} removal
            {pendingRemovalCount === 1 ? "" : "s"}. All changes are local and pending demo admin
            review — nothing was sent or stored.
          </span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Associated doctors</CardTitle>
          <CardDescription>
            {associatedRows.filter((row) => row !== undefined).length} doctors associated with the
            demo hospital in fixture data.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-0 px-0 py-0">
          {associatedRows.every((row) => row === undefined) ? (
            <div className="p-4">
              <EmptyState
                icon={StethoscopeIcon}
                title="No associated doctors"
                description="Doctors from the demo directory appear here once an association request is approved by demo admin review."
              />
            </div>
          ) : (
            <DataTable
              columns={associatedColumns}
              rows={associatedRows.filter((row): row is Doctor => row !== undefined)}
              getRowKey={(row) => row.id}
              emptyMessage="No associated doctors in the demo set."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory search</CardTitle>
          <CardDescription>
            Search all demo doctors by name, specialty or city. Requests stay local and pending
            admin review.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_11rem_9rem]">
            <div className="relative">
              <SearchIcon
                aria-hidden
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="doctor-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, specialty, city…"
                aria-label="Search demo doctors"
                className="pl-8"
              />
            </div>
            <Select value={specialization} onValueChange={(next) => setSpecialization(next ?? "all")}>
              <SelectTrigger aria-label="Filter by specialty" className="w-full">
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Specialty</SelectLabel>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specializationOptions.map((id) => (
                    <SelectItem key={id} value={id}>
                      {specialtyById[id]?.name ?? id}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={(next) => setCity(next ?? "all")}>
              <SelectTrigger aria-label="Filter by city" className="w-full">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>City</SelectLabel>
                  <SelectItem value="all">All cities</SelectItem>
                  {cityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} in the demo directory.
          </p>

          <DataTable
            columns={resultColumns}
            rows={results}
            getRowKey={(row) => row.id}
            emptyMessage="No doctors match the demo search."
            emptyIcon={StethoscopeIcon}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Demo boundary: hospitalId reference for this session is {hospitalId}. Association
        add/remove actions never call a backend and are visible only on this page.
      </p>
    </div>
  )
}

function initialsOf(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
