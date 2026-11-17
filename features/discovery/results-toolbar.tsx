"use client"

/**
 * ResultsToolbar — shared discovery shell (A03).
 *
 * Result count + sort select (+ optional parent-owned view toggle slot).
 * Never fetches, owns no state.
 *
 * Integration modes:
 * - Client parents pass `onSortChange(nextSort)` and own the URL.
 * - Server parents pass `basePath` + `currentParams`; this component replaces
 *   ?sort= (resetting ?page= to 1) and navigates via the router.
 */

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  type ResultsToolbarProps,
  type SortOption,
} from "@/features/discovery/types"

function formatCount(
  total: string | number,
  entityLabel: string,
  pluralLabel?: string,
): string {
  if (typeof total === "number") {
    const plural = pluralLabel ?? `${entityLabel}s`
    return total === 1 ? `1 ${entityLabel}` : `${total} ${plural}`
  }
  return total
}

/**
 * Replace ?sort= in a raw searchParams record, dropping ?page=. Returns the
 * canonical query string (params sorted for shareable URLs).
 */
function buildSortQuery(
  currentParams: Record<string, string | string[] | undefined>,
  nextSort: string,
): string {
  const params = new URLSearchParams()
  const sortedKeys = Object.keys(currentParams)
    .filter((key) => key !== "page" && key !== "sort")
    .sort()
  for (const key of sortedKeys) {
    const raw = currentParams[key]
    const values = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : []
    for (const value of values) {
      if (value !== "") params.append(key, value)
    }
  }
  if (nextSort !== "") params.set("sort", nextSort)
  const query = params.toString()
  return query === "" ? "" : `?${query}`
}

export function ResultsToolbar({
  total,
  entityLabel,
  pluralLabel,
  sortOptions,
  sortValue,
  onSortChange,
  basePath,
  currentParams,
  viewToggle,
  className,
}: ResultsToolbarProps) {
  const router = useRouter()

  // Value→label map so the closed trigger shows the option label instead of
  // the raw value (Base UI renders the raw value without `items`).
  const sortItems = useMemo(
    () =>
      Object.fromEntries(sortOptions.map((option) => [option.value, option.label])),
    [sortOptions],
  )

  const handleSortChange = (nextValue: unknown) => {
    if (typeof nextValue !== "string") return
    if (onSortChange) {
      onSortChange(nextValue)
      return
    }
    if (basePath && currentParams) {
      router.push(`${basePath}${buildSortQuery(currentParams, nextValue)}`)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p aria-live="polite" className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {formatCount(total, entityLabel, pluralLabel)}
        </span>{" "}
        found
      </p>
      <div className="flex items-center gap-2">
        {viewToggle}
        <Select
          value={sortValue}
          items={sortItems}
          onValueChange={handleSortChange}
        >
          <SelectTrigger aria-label="Sort results" size="sm" className="w-[11rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option: SortOption) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
