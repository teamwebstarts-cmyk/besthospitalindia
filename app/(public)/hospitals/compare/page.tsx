"use client"

/**
 * /hospitals/compare — Hospital comparison (Agent A04).
 *
 * Spec: implementation/pages/06-hospital-compare.md — selected hospitals;
 * compare table; separate PER row and CER row; methodology note; enquiry CTA.
 * Selection: up to 3 hospitals (proposed limit), persisted in the ?ids= URL
 * param so comparisons are shareable. Duplicate and unknown ids are ignored.
 *
 * This page is a client component because selection is interactive; the
 * ComparisonTable itself stays presentational. All data comes from the typed
 * hospital fixtures via the shared lookup map — no fetching, no mock
 * submission. Trust model: PER and CER render as distinct table rows and are
 * never combined or averaged.
 */

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GitCompareArrowsIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { ComparisonTable, MAX_COMPARE_HOSPITALS } from "@/features/providers/components/comparison-table"
import { hospitalById, hospitals } from "@/data"
import { ROUTES } from "@/constants/routes"

function CompareExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Selection lives in ?ids=<id1,id2,…> — shareable URLs per the page contract.
  const ids = React.useMemo(() => {
    const raw = searchParams.get("ids") ?? ""
    const seen = new Set<string>()
    const selected: string[] = []
    for (const id of raw.split(",")) {
      if (id !== "" && hospitalById[id] !== undefined && !seen.has(id)) {
        seen.add(id)
        selected.push(id)
      }
    }
    return selected.slice(0, MAX_COMPARE_HOSPITALS)
  }, [searchParams])

  const selectedHospitals = React.useMemo(
    () => ids.map((id) => hospitalById[id]).filter((hospital) => hospital !== undefined),
    [ids],
  )

  const replaceIds = React.useCallback(
    (nextIds: string[]) => {
      const query = nextIds.length > 0 ? `?ids=${encodeURIComponent(nextIds.join(","))}` : ""
      router.replace(`${ROUTES.public.hospitalComparison}${query}`, { scroll: false })
    },
    [router],
  )

  const handleAdd = (rawValue: unknown) => {
    if (typeof rawValue !== "string" || rawValue === "") return
    if (ids.length >= MAX_COMPARE_HOSPITALS || ids.includes(rawValue)) return
    replaceIds([...ids, rawValue])
  }

  const handleRemove = (id: string) => {
    replaceIds(ids.filter((selected) => selected !== id))
  }

  const addableHospitals = hospitals.filter((hospital) => !ids.includes(hospital.id))
  const atLimit = ids.length >= MAX_COMPARE_HOSPITALS

  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.public.home },
          { label: "Hospitals", href: ROUTES.public.hospitals },
          { label: "Compare" },
        ]}
      />

      <header className="space-y-2">
        <SectionHeading
          as="h1"
          title="Compare hospitals"
          description="Compare up to three demo hospitals side by side. Patient experience (PER) and clinical expertise (CER) ratings appear as separate rows — this comparison never computes a combined or overall score."
        />
      </header>

      {/* Selection controls */}
      <section className="space-y-3">
        <h2 id="selection-heading" className="sr-only">
          Selected hospitals
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {selectedHospitals.length > 0 ? (
            selectedHospitals.map((hospital) => (
              <Badge key={hospital.id} variant="outline" className="h-7 gap-1.5 py-1 pr-1 text-sm">
                <span className="max-w-64 truncate font-normal">{hospital.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(hospital.id)}
                  aria-label={`Remove ${hospital.name} from comparison`}
                  className="rounded-full p-0.5 transition-colors hover:bg-muted"
                >
                  <XIcon aria-hidden className="size-3.5" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hospitals selected yet — add up to {MAX_COMPARE_HOSPITALS} below.</p>
          )}
          {selectedHospitals.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => replaceIds([])}>
              Clear all
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {atLimit ? (
            <p className="text-sm text-muted-foreground">
              Comparison is limited to {MAX_COMPARE_HOSPITALS} hospitals. Remove one to add another.
            </p>
          ) : addableHospitals.length > 0 ? (
            <Select
              key={ids.length}
              onValueChange={handleAdd}
              items={Object.fromEntries(
                addableHospitals.map((hospital) => [
                  hospital.id,
                  `${hospital.name} — ${hospital.city}`,
                ]),
              )}
            >
              <SelectTrigger aria-label="Add a hospital to compare" className="w-72">
                <SelectValue placeholder="Add a hospital to compare…" />
              </SelectTrigger>
              <SelectContent>
                {addableHospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name} — {hospital.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">All demo hospitals are in the comparison.</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Selection is stored in the page URL — copy the address to share this exact comparison. Demo data only.
        </p>
      </section>

      {/* Comparison */}
      {selectedHospitals.length === 0 ? (
        <EmptyState
          icon={GitCompareArrowsIcon}
          title="Nothing to compare yet"
          description={`Add up to ${MAX_COMPARE_HOSPITALS} demo hospitals above to see them side by side, or browse the directory and pick from there.`}
          action={{ label: "Browse hospitals", href: ROUTES.public.hospitals }}
        />
      ) : (
        <section className="space-y-3">
          <h2 id="table-heading" className="sr-only">
            Comparison table
          </h2>
          <ComparisonTable hospitals={selectedHospitals} />

          <p className="max-w-3xl text-xs text-muted-foreground">
            Ratings methodology note: PER ({`Patient Experience Rating`}) and CER ({`Clinical Expertise Rating`}) are
            independent assessments with their own evidence metadata. Missing scores render as “Not yet rated” or
            “Assessment pending” — never as 0/5. See the{" "}
            <Link
              href={ROUTES.public.ratingMethodology}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              rating methodology
            </Link>{" "}
            page. All values are fictional demo data.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button render={<Link href={ROUTES.public.freeConsultation} />}>Request a free consultation</Button>
            <Button variant="outline" render={<Link href={ROUTES.public.hospitals} />}>
              Back to directory
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

export default function HospitalComparePage() {
  return (
    <Suspense fallback={<div className="py-8 text-sm text-muted-foreground">Loading comparison…</div>}>
      <CompareExperience />
    </Suspense>
  )
}
