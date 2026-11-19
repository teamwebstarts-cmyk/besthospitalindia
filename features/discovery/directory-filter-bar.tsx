"use client"

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

export function DirectoryFilterBar({
  basePath,
  search,
  selects,
  sort,
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

  const selectCount = selects.length

  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs ring-1 ring-foreground/5 sm:gap-3.5 sm:p-4",
        selectCount <= 1 && "sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_auto] lg:items-end",
        selectCount === 2 &&
          "sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,9rem)_minmax(0,9rem)_minmax(0,9rem)_auto] lg:items-end",
        selectCount >= 3 &&
          "sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,8.5rem))_minmax(0,9rem)_auto] xl:items-end",
        className,
      )}
    >
      <div
        className={cn(
          "space-y-1.5",
          selectCount <= 1 && "sm:col-span-2 lg:col-span-1",
          selectCount === 2 && "sm:col-span-2 lg:col-span-1",
          selectCount >= 3 && "sm:col-span-2 xl:col-span-1",
        )}
      >
        <Label htmlFor="directory-filter-search">{search.label}</Label>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            pushParams({ [queryParam]: draftQuery })
          }}
          className="flex gap-2"
        >
          <Input
            id="directory-filter-search"
            type="search"
            name={queryParam}
            key={search.value}
            placeholder={search.placeholder}
            value={draftQuery}
            onChange={(event) => setDraftOverride(event.target.value)}
            className="min-h-10 min-w-0 flex-1"
          />
          <Button type="submit" variant="outline" className="shrink-0">
            <SearchIcon data-icon="inline-start" aria-hidden className="size-4" />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        </form>
      </div>

      {selects.map((field) => {
        const empty = field.emptyValue ?? "all"
        const controlled = field.value === "" ? empty : field.value
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={controlled}
              items={selectItems(field)}
              onValueChange={(value) => pushParams({ [field.param]: value ?? null })}
            >
              <SelectTrigger id={field.id} className="w-full min-h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}

      <div className="space-y-1.5">
        <Label htmlFor="directory-filter-sort">Sort</Label>
        <Select
          value={sort.value}
          items={sortItems}
          onValueChange={(value) => pushParams({ [sort.param]: value ?? null })}
        >
          <SelectTrigger id="directory-filter-sort" className="w-full min-h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sort.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        className={cn(
          "min-h-10 w-full sm:col-span-2 sm:w-auto",
          selectCount >= 2 && "sm:col-span-1",
          "xl:col-span-1 xl:w-auto xl:justify-self-end",
        )}
        disabled={!hasFilters}
        onClick={clearAll}
      >
        <RotateCcwIcon data-icon="inline-start" aria-hidden className="size-4" />
        Clear all
      </Button>
    </div>
  )
}