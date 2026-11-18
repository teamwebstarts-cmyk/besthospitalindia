"use client"

/**
 * GlobalSearch — shared discovery shell (A03).
 *
 * Entity-type select + query input; submits to the chosen entity listing with
 * ?q=<query> (dropping page/pageSize). Routed navigation keeps ?q shareable.
 * Controlled shell component: never fetches, owns no filter state.
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type SearchEntityType,
  type GlobalSearchProps,
} from "@/features/discovery/types"

/** Canonical display labels for the selectable entity types. */
const ENTITY_TYPE_LABELS: Record<SearchEntityType, string> = {
  hospitals: "Hospitals",
  doctors: "Doctors",
  treatments: "Treatments",
  facilities: "Facilities",
}

/** Value→label map so the closed trigger shows the label, not the raw value. */
const ENTITY_TYPE_ITEMS: Record<string, React.ReactNode> = {
  hospitals: ENTITY_TYPE_LABELS.hospitals,
  doctors: ENTITY_TYPE_LABELS.doctors,
  treatments: ENTITY_TYPE_LABELS.treatments,
  facilities: ENTITY_TYPE_LABELS.facilities,
}

export function GlobalSearch({
  defaultEntityType = "facilities",
  initialQuery = "",
  routes,
  submitLabel = "Search",
  queryLabel = "Search query",
  className,
  layout = "default",
}: GlobalSearchProps) {
  const router = useRouter()
  const [entityType, setEntityType] = React.useState<SearchEntityType>(defaultEntityType)
  const [query, setQuery] = React.useState(initialQuery)
  const queryFieldId = React.useId()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const targetRoute = routes[entityType]
    if (!targetRoute) return
    const trimmedQuery = query.trim()
    router.push(
      trimmedQuery === "" ? targetRoute : `${targetRoute}?q=${encodeURIComponent(trimmedQuery)}`,
    )
  }

  const isHeader = layout === "header"

  const entitySelect = (
    <Select
      value={entityType}
      items={ENTITY_TYPE_ITEMS}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") {
          setEntityType(nextValue as SearchEntityType)
        }
      }}
    >
      <SelectTrigger
        aria-label="Search entity type"
        size={isHeader ? "sm" : "default"}
        className={cn(
          "w-full",
          isHeader &&
            "h-9 w-[5.25rem] shrink-0 rounded-none border-0 border-r border-border/80 bg-transparent px-2 shadow-none sm:w-[6.75rem] sm:px-2.5"
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(ENTITY_TYPE_LABELS) as SearchEntityType[]).map((type) => (
          <SelectItem key={type} value={type}>
            {ENTITY_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const queryInput = (
    <div className={cn("relative min-w-0 flex-1", isHeader && "flex h-9 items-center")}>
      {!isHeader && (
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      )}
      <label className="sr-only" htmlFor={queryFieldId}>
        {queryLabel}
      </label>
      <Input
        id={queryFieldId}
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={
          isHeader
            ? "Search doctors, hospitals…"
            : "Search by name, city or service…"
        }
        className={cn(
          isHeader
            ? "h-9 min-w-0 rounded-none rounded-r-full border-0 bg-transparent px-2 pr-9 text-sm shadow-none focus-visible:ring-0 sm:px-3"
            : "pl-9"
        )}
      />
      {isHeader && (
        <button
          type="submit"
          className="absolute top-1/2 right-0 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label={submitLabel}
        >
          <SearchIcon aria-hidden className="size-4" />
        </button>
      )}
    </div>
  )

  const submitButton = (
    <Button type="submit" variant="cta" className="font-semibold shadow-sm">
      {submitLabel}
    </Button>
  )

  if (isHeader) {
    return (
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "flex h-9 w-full min-w-0 items-stretch overflow-hidden rounded-full border border-border/80 bg-muted/40",
          className
        )}
      >
        {entitySelect}
        {queryInput}
      </form>
    )
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={className}>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="w-full sm:w-44">{entitySelect}</div>
        {queryInput}
        {submitButton}
      </div>
    </form>
  )
}
