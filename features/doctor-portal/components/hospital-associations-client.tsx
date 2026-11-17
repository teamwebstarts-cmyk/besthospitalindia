"use client"

/**
 * HospitalAssociationsClient — /doctor-portal/hospitals (pages/59).
 *
 * Two panels per spec ("View and request hospital/clinic associations"):
 * 1. Current associations — derived from Doctor.hospitalIds (two-way consistent
 *    with Hospital.doctorIds), rendered as compact hospital cards with remove
 *    for pending requests only (established associations are fixture-governed).
 * 2. Request an association — search over the shared hospital fixtures via the
 *    pure searchHospitals selector; requesting adds a LOCAL pending request
 *    ("Pending review"), never touching the fixtures (pages/59 acceptance:
 *    "New association marked pending review").
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
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { HospitalCardRatingModule } from "@/features/providers/components/hospital-card"
import { ROUTES } from "@/constants/routes"
import { hospitalDisplayName } from "@/features/doctor-portal/selectors"
import { searchHospitals } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Doctor, Hospital } from "@/types"

export interface HospitalAssociationsClientProps {
  doctor: Doctor
  /** Hospitals the doctor is currently associated with (fixture-derived). */
  associated: Hospital[]
  className?: string
}

interface PendingRequest {
  hospitalId: string
  requestedAt: string
}

function HospitalRow({ hospital }: { hospital: Hospital }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">{hospital.name}</p>
          <p className="text-xs text-muted-foreground">
            {hospital.facilityType} · {hospital.city}, {hospital.state}
          </p>
        </div>
        <VerificationBadge status={hospital.verificationStatus} />
      </div>
      <div className="mt-3 flex gap-2" data-slot="association-ratings">
        <HospitalCardRatingModule rating={hospital.ratings.per} />
        <HospitalCardRatingModule rating={hospital.ratings.cer} />
      </div>
    </div>
  )
}

export function HospitalAssociationsClient({
  doctor,
  associated,
  className,
}: HospitalAssociationsClientProps) {
  const [query, setQuery] = useState("")
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const pendingIds = useMemo(
    () => new Set(pendingRequests.map((request) => request.hospitalId)),
    [pendingRequests],
  )
  const associatedIds = useMemo(
    () => new Set(associated.map((hospital) => hospital.id)),
    [associated],
  )

  const results = useMemo(() => {
    const trimmed = query.trim()
    return searchHospitals(trimmed === "" ? undefined : { query: trimmed }).filter(
      (hospital) => !associatedIds.has(hospital.id),
    )
  }, [query, associatedIds])

  function requestAssociation(hospital: Hospital) {
    setPendingRequests((previous) => [
      ...previous,
      { hospitalId: hospital.id, requestedAt: new Date().toISOString() },
    ])
    setNotice(
      `Demo request sent to ${hospital.name} — marked "pending review" locally. No message was sent to any hospital.`,
    )
  }

  function withdrawRequest(hospitalId: string) {
    const name = hospitalDisplayName(hospitalId)
    setPendingRequests((previous) => previous.filter((request) => request.hospitalId !== hospitalId))
    setNotice(`Demo request to ${name} withdrawn. Nothing was ever sent anywhere.`)
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      {/* Current associations */}
      <Card>
        <CardHeader>
          <CardTitle>Current associations</CardTitle>
          <CardDescription>
            Derived from the demo doctor fixture — hospital links are verified by the demo
            coordination desk, not edited here.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          {associated.length > 0 ? (
            <ul className="space-y-3" aria-label="Current hospital associations">
              {associated.map((hospital) => (
                <li key={hospital.id}>
                  <HospitalRow hospital={hospital} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No hospital associations in the demo fixture"
              description="This demo doctor fixture has no linked hospitals. Use the search panel to practice sending a mock association request."
            />
          )}
        </CardContent>
      </Card>

      {/* Request a new association */}
      <Card>
        <CardHeader>
          <CardTitle>Request a new association</CardTitle>
          <CardDescription>
            Search the demo hospital directory and send a mock association request. Requests
            stay on this page as local demo state.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="space-y-1.5">
            <label htmlFor="hospital-association-search" className="sr-only">
              Search demo hospitals by name, city or type
            </label>
            <Input
              id="hospital-association-search"
              type="search"
              placeholder="Search demo hospitals…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setNotice(null)
              }}
            />
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            {notice}
          </p>

          {pendingRequests.length > 0 ? (
            <section aria-label="Pending association requests" className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Pending review (local demo state)
              </p>
              <ul className="space-y-2">
                {pendingRequests.map((request) => (
                  <li
                    key={request.hospitalId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {hospitalDisplayName(request.hospitalId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested in this demo session — nothing was sent.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status="pending" label="Pending review" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => withdrawRequest(request.hospitalId)}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.length > 0 ? (
            <ul className="space-y-2" aria-label="Demo hospital search results">
              {results.map((hospital) => {
                const alreadyPending = pendingIds.has(hospital.id)
                return (
                  <li
                    key={hospital.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {hospital.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hospital.city} · {hospital.doctorIds.length} demo doctors
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {alreadyPending ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Requested
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestAssociation(hospital)}
                        >
                          Request association
                          <span className="sr-only"> — {hospital.name}</span>
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState
              title="No demo hospitals match"
              description="Try a shorter search — the directory contains eight fictional demo hospitals."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
