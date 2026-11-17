"use client"

/**
 * TreatmentFilters — URL-param filter controls for /treatments (Agent A06).
 *
 * Contract source: implementation/10-treatments.md ("ListingFilters" +
 * "ResultsToolbar"). Filtering behavior lives in the URL (server page reads
 * searchParams); this component only pushes new URLs via next/navigation
 * router.replace with scroll: false. Works without JS? The server page also
 * renders a GET form fallback — this client bar is an enhancement.
 */

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcwIcon, SearchIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { specialties } from "@/data"

export type TreatmentSortValue = "relevance" | "name-asc" | "name-desc"

/** Value→label maps so the closed triggers show labels, not raw values. */
const TREATMENT_SORT_LABELS = {
  relevance: "Featured order",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
} as const satisfies Record<TreatmentSortValue, string>

const SPECIALTY_ITEMS: Record<string, React.ReactNode> = {
  all: "All specialties",
  ...Object.fromEntries(specialties.map((item) => [item.id, item.name])),
}

const SORT_ITEMS: Record<string, React.ReactNode> = TREATMENT_SORT_LABELS

export interface TreatmentFiltersProps {
  /** Current values (server-resolved) so the bar can render controlled. */
  query: string
  specialty: string
  sort: TreatmentSortValue
  className?: string
}

export function TreatmentFilters({ query, specialty, sort, className }: TreatmentFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Derive the draft from the URL prop directly; when the URL changes (e.g.
  // back/forward navigation), React re-renders and the key below remounts the
  // input so uncontrolled-style drafts never drift from the URL.
  const [draftOverride, setDraftOverride] = React.useState<string | null>(null)
  const draftQuery = draftOverride ?? query

  const pushParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      // Any filter change resets pagination.
      params.delete("page")
      const qs = params.toString()
      setDraftOverride(null)
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams]
  )

  const hasFilters =
    query !== "" || (specialty !== "" && specialty !== "all") || sort !== "relevance"

  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-[1fr_220px_180px_auto] lg:items-end",
        className
      )}
    >
      <div className="space-y-1.5">
        <Label htmlFor="treatment-search">Search treatments</Label>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            pushParams({ query: draftQuery })
          }}
          className="flex gap-2"
        >
          <Input
            id="treatment-search"
            type="search"
            name="q"
            key={query}
            placeholder="e.g. transplant, knee, care"
            value={draftQuery}
            onChange={(event) => setDraftOverride(event.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            <SearchIcon data-icon="inline-start" aria-hidden />
            Search
          </Button>
        </form>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="treatment-specialty">Specialty</Label>
        <Select
          value={specialty || "all"}
          items={SPECIALTY_ITEMS}
          onValueChange={(value) => pushParams({ specialty: value ?? null })}
        >
          <SelectTrigger id="treatment-specialty" className="w-full">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {specialties.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="treatment-sort">Sort</Label>
        <Select
          value={sort}
          items={SORT_ITEMS}
          onValueChange={(value) => pushParams({ sort: value ?? null })}
        >
          <SelectTrigger id="treatment-sort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Featured order</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        disabled={!hasFilters}
        onClick={() => {
          setDraftOverride(null)
          router.replace("?", { scroll: false })
        }}
      >
        <RotateCcwIcon data-icon="inline-start" aria-hidden />
        Clear all
      </Button>
    </div>
  )
}
