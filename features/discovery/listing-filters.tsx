"use client"

/**
 * ListingFilters — shared discovery shell (A03).
 *
 * Controlled facet panel: renders the facet config against the current values
 * and writes changes back. State lives in the parent page's URL search params
 * — this component never fetches and never stores filter state.
 *
 * Integration modes:
 * - Client parents pass `onFiltersChange(nextValues)` and own the URL.
 * - Server parents pass `basePath` (+ `extraParams`); this component composes
 *   the URL with buildFilterQueryString and navigates via the router,
 *   resetting ?page= to 1 on every change.
 *
 * Layout: desktop — a column; below lg — collapsed into a Sheet behind a
 * "Filters" trigger button.
 */

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  buildFilterQueryString,
  countActiveFilters,
  toFilterValueList,
  type DiscoveryFacet,
  type DiscoveryFacetOption,
  type DiscoveryFilterValues,
  type ListingFiltersProps,
} from "@/features/discovery/types"
import { cn } from "@/lib/utils"

interface FacetControlProps {
  facet: DiscoveryFacet
  values: DiscoveryFilterValues
  /** Writes the next value list for one facet param. */
  onFacetChange: (param: string, nextValues: string[]) => void
}

function MultiSelectFacetControl({ facet, values, onFacetChange }: FacetControlProps) {
  if (facet.kind !== "multi-select") return null
  const current = toFilterValueList(values[facet.param])

  const handleToggle = (optionValue: string, checked: boolean) => {
    const withoutOption = current.filter((value) => value !== optionValue)
    onFacetChange(facet.param, checked ? [...current, optionValue] : withoutOption)
  }

  return (
    <div className="space-y-2.5">
      {facet.options.map((option) => {
        const optionId = `facet-${facet.param}-${option.value}`
        return (
          <div key={option.value} className="flex items-start gap-2">
            <Checkbox
              id={optionId}
              checked={current.includes(option.value)}
              onCheckedChange={(checked) => handleToggle(option.value, checked)}
            />
            <div className="grid gap-0.5">
              <Label
                htmlFor={optionId}
                className="cursor-pointer items-start leading-snug font-normal"
              >
                {option.label}
              </Label>
              {option.hint ? (
                <span className="text-xs text-muted-foreground">{option.hint}</span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SelectFacetControl({ facet, values, onFacetChange }: FacetControlProps) {
  if (facet.kind !== "select") return null
  const blankOption = facet.includeBlank
  const current = toFilterValueList(values[facet.param])[0] ?? blankOption?.value

  const handleValueChange = (nextValue: unknown) => {
    if (typeof nextValue !== "string") return
    const isBlank = blankOption !== undefined && nextValue === blankOption.value
    onFacetChange(facet.param, isBlank ? [] : [nextValue])
  }

  const options: DiscoveryFacetOption[] = blankOption
    ? [blankOption, ...facet.options]
    : facet.options

  // Value→label map so the closed trigger shows the option label instead of
  // the raw value (Base UI renders the raw value without `items`).
  const items = Object.fromEntries(
    options.map((option) => [option.value, option.label]),
  )

  return (
    <Select value={current} items={items} onValueChange={handleValueChange}>
      <SelectTrigger aria-label={facet.label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ListingFilters({
  facets,
  values,
  onFiltersChange,
  basePath,
  extraParams,
  triggerLabel = "Filters",
  showActiveCount = true,
  className,
  layout = "sidebar",
}: ListingFiltersProps & { layout?: "sidebar" | "sheet-only" }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  /** Write the next full values map: callback mode, or URL-composition mode. */
  const applyValues = (nextValues: DiscoveryFilterValues) => {
    if (onFiltersChange) {
      onFiltersChange(nextValues)
      return
    }
    if (!basePath) return
    // URL mode: write only the declared facet params (scalar params like q
    // are preserved via extraParams, avoiding duplicate URL params), and
    // reset ?page= to 1 by omitting it.
    const facetValues: DiscoveryFilterValues = {}
    for (const facet of facets) {
      facetValues[facet.param] = toFilterValueList(nextValues[facet.param])
    }
    const query = buildFilterQueryString(facetValues, { ...extraParams, page: undefined })
    router.push(query === "" ? basePath : `${basePath}${query}`)
  }

  const handleFacetChange = (param: string, facetValues: string[]) => {
    applyValues({ ...values, [param]: facetValues })
  }

  const clearAll = () => {
    const nextValues: DiscoveryFilterValues = {}
    for (const facet of facets) {
      nextValues[facet.param] = []
    }
    applyValues(nextValues)
  }

  const activeCount = countActiveFilters(values)
  const activeCountBadge =
    showActiveCount && activeCount > 0 ? (
      <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs leading-none font-medium text-primary-foreground">
        {activeCount}
      </span>
    ) : null

  const facetGroups = facets.map((facet) => (
    <section key={facet.param} className="space-y-2.5" aria-label={facet.label}>
      <h3 className="text-sm font-semibold">{facet.label}</h3>
      {facet.kind === "multi-select" ? (
        <MultiSelectFacetControl
          facet={facet}
          values={values}
          onFacetChange={handleFacetChange}
        />
      ) : (
        <SelectFacetControl
          facet={facet}
          values={values}
          onFacetChange={handleFacetChange}
        />
      )}
    </section>
  ))
  const showSheet = layout === "sheet-only" || layout === "sidebar"
  const showDesktopColumn = layout === "sidebar"

  return (
    <div className={className}>
      {showSheet ? (
      <div className={cn(showDesktopColumn && "lg:hidden")}>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "text-xs font-semibold sm:text-sm",
                  layout === "sheet-only"
                    ? "h-9 w-full rounded-lg sm:w-auto"
                    : "h-10 w-full rounded-xl",
                )}
              >
                {triggerLabel}
                {activeCountBadge}
              </Button>
            }
          />
          <SheetContent
            side="bottom"
            className="z-[80] max-h-[min(78dvh,36rem)] gap-0 rounded-t-2xl p-0 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]"
          >
            <SheetHeader className="border-b px-4 py-3 pr-12 text-left">
              <SheetTitle className="text-base">{triggerLabel}</SheetTitle>
              <SheetDescription className="text-xs">
                Filters apply together. Close to see the list.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
              {facetGroups}
            </div>
            <SheetFooter className="flex-row gap-2 border-t px-4 py-3">
              <Button variant="ghost" className="h-10 flex-1" onClick={clearAll}>
                Clear all
              </Button>
              <Button className="h-10 flex-1" onClick={() => setMobileOpen(false)}>
                Show results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      ) : null}

      {showDesktopColumn ? (
      <div className="hidden lg:block">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Filters</h2>
          <Button variant="ghost" size="xs" onClick={clearAll}>
            Clear all
          </Button>
        </div>
        <div className="space-y-6">{facetGroups}</div>
      </div>
      ) : null}
    </div>
  )
}
