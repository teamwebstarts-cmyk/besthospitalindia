"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DirectoryFilterSelectField {
  id: string
  param: string
  label: string
  value: string
  /** When set, this value clears the param (e.g. "all" or ""). */
  emptyValue?: string
  options: readonly { value: string; label: string }[]
}

export interface DirectoryFilterSortField {
  param: string
  value: string
  defaultValue: string
  options: readonly { value: string; label: string }[]
}

export interface DirectoryFilterBarProps {
  basePath: string
  search: {
    param?: string
    label: string
    placeholder: string
    value: string
  }
  selects: readonly DirectoryFilterSelectField[]
  sort: DirectoryFilterSortField
  /** e.g. multi-select facets in a sheet — rendered below the select row. */
  advancedFilters?: React.ReactNode
  className?: string
}

function selectItems(field: DirectoryFilterSelectField): Record<string, React.ReactNode> {
  const empty = field.emptyValue ?? "all"
  const blankLabel =
    field.options.find((o) => o.value === empty)?.label ?? field.options[0]?.label ?? "All"
  return {
    [empty]: blankLabel,
    ...Object.fromEntries(field.options.filter((o) => o.value !== empty).map((o) => [o.value, o.label])),
  }
}

const selectTriggerClass =
  "h-9 w-full min-w-0 text-xs shadow-none data-[size=sm]:h-9"

const selectContentProps = {
  side: "bottom" as const,
  align: "start" as const,
  alignItemWithTrigger: false,
}

export function DirectoryFilterBar({
  basePath,
  search,
  selects,
  sort,
  advancedFilters,
  className,
}: DirectoryFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = search.param ?? "q"
  const [draftOverride, setDraftOverride] = React.useState<string | null>(null)
  const draftQuery = draftOverride ?? search.value

  const sortItems = Object.fromEntries(sort.options.map((o) => [o.value, o.label]))

  const pushParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
          continue
        }
        const field = selects.find((s) => s.param === key)
        const empty = field?.emptyValue ?? "all"
        if (field && (value === empty || value === "all")) {
          params.delete(key)
        } else if (key === sort.param && value === sort.defaultValue) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      params.delete("page")
      setDraftOverride(null)
      const qs = params.toString()
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
    },
    [router, searchParams, basePath, selects, sort.defaultValue, sort.param],
  )

  const hasFilters =
    search.value !== "" ||
    selects.some((field) => {
      const empty = field.emptyValue ?? "all"
      return field.value !== "" && field.value !== empty
    }) ||
    sort.value !== sort.defaultValue

  const clearAll = () => {
    setDraftOverride(null)
    router.replace(basePath, { scroll: false })
  }

  const filterCellCount = selects.length + 1

  const filterGridClass =
    filterCellCount <= 3
      ? "grid-cols-3"
      : filterCellCount === 4
        ? "grid-cols-2 sm:grid-cols-4"
        : filterCellCount === 5
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6"

  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-card/95 p-2.5 shadow-xs sm:p-3.5",
        className,
      )}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          pushParams({ [queryParam]: draftQuery })
        }}
        className="flex gap-1.5"
      >
        <label htmlFor="directory-filter-search" className="sr-only">
          {search.label}
        </label>
        <Input
          id="directory-filter-search"
          type="search"
          name={queryParam}
          key={search.value}
          placeholder={search.placeholder}
          value={draftQuery}
          onChange={(event) => setDraftOverride(event.target.value)}
          className="h-9 min-h-9 min-w-0 flex-1 text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          aria-label="Search"
        >
          <SearchIcon aria-hidden className="size-4" />
        </Button>
      </form>

      <div className={cn("mt-2 grid gap-1.5 sm:gap-2", filterGridClass)}>
        {selects.map((field) => {
          const empty = field.emptyValue ?? "all"
          const controlled = field.value === "" ? empty : field.value
          return (
            <Select
              key={field.id}
              value={controlled}
              items={selectItems(field)}
              onValueChange={(value) => pushParams({ [field.param]: value ?? null })}
            >
              <SelectTrigger
                id={field.id}
                size="sm"
                aria-label={field.label}
                className={selectTriggerClass}
              >
                <SelectValue placeholder={field.label} />
              </SelectTrigger>
              <SelectContent {...selectContentProps}>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}

        <Select
          value={sort.value}
          items={sortItems}
          onValueChange={(value) => pushParams({ [sort.param]: value ?? null })}
        >
          <SelectTrigger
            id="directory-filter-sort"
            size="sm"
            aria-label="Sort"
            className={cn(
              selectTriggerClass,
              filterCellCount > 3 && "col-span-1",
            )}
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent {...selectContentProps}>
            {sort.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {advancedFilters ? <div className="mt-2">{advancedFilters}</div> : null}

      {hasFilters ? (
        <div className="mt-1.5 flex justify-end sm:mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={clearAll}
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden className="size-3.5" />
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  )
}