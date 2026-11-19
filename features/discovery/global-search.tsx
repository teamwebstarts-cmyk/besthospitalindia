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
  PUBLIC_DIRECTORY_ENTITY_TYPES,
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

export function GlobalSearch({
  defaultEntityType = "facilities",
  entityTypes = PUBLIC_DIRECTORY_ENTITY_TYPES,
  initialQuery = "",
  routes,
  submitLabel = "Search",
  queryLabel = "Search query",
  className,
  layout = "default",
}: GlobalSearchProps) {
  const router = useRouter()
  const resolvedDefault = entityTypes.includes(defaultEntityType)
    ? defaultEntityType
    : (entityTypes[0] ?? "hospitals")
  const [entityType, setEntityType] = React.useState<SearchEntityType>(resolvedDefault)
  const entityTypeItems = Object.fromEntries(
    entityTypes.map((type) => [type, ENTITY_TYPE_LABELS[type]]),
  )

  React.useEffect(() => {
    if (!entityTypes.includes(entityType)) {
      setEntityType(entityTypes[0] ?? "hospitals")
    }
  }, [entityType, entityTypes])
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

  const headerSelectField = (
    <div className="flex h-full w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem] shrink-0 items-stretch self-stretch border-r border-border/60 sm:w-[7.75rem] sm:min-w-[7.75rem] sm:max-w-[7.75rem]">
      <Select
        value={entityType}
        items={entityTypeItems}
        onValueChange={(nextValue) => {
          if (typeof nextValue !== "string") return
          const next = nextValue as SearchEntityType
          setEntityType(next)
          const targetRoute = routes[next]
          if (!targetRoute) return
          const trimmedQuery = query.trim()
          router.push(
            trimmedQuery === ""
              ? targetRoute
              : `${targetRoute}?q=${encodeURIComponent(trimmedQuery)}`,
          )
        }}
      >
        <SelectTrigger
          aria-label="Search entity type"
          size="default"
          className="h-full w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem] gap-1 rounded-none rounded-l-full border-0 bg-transparent px-2.5 py-0 text-base font-medium text-foreground shadow-none focus-visible:ring-0 data-[size=default]:h-full sm:w-[7.75rem] sm:min-w-[7.75rem] sm:max-w-[7.75rem] sm:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" side="bottom" alignItemWithTrigger={false}>
          {entityTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {ENTITY_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const entitySelect = isHeader ? (
    headerSelectField
  ) : (
    <Select
      value={entityType}
      items={entityTypeItems}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") {
          setEntityType(nextValue as SearchEntityType)
        }
      }}
    >
      <SelectTrigger aria-label="Search entity type" size="default" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {entityTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {ENTITY_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const queryInput = (
    <div
      className={cn(
        "relative min-w-0 flex-1",
        isHeader && "flex h-full items-center self-stretch"
      )}
    >
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
        placeholder={isHeader ? "Search…" : "Search by name, city or service…"}
        className={cn(
          isHeader
            ? "h-full min-h-0 min-w-0 rounded-none rounded-r-full border-0 bg-transparent py-0 pl-3 pr-10 text-base leading-normal text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:text-sm"
            : "pl-9"
        )}
      />
      {isHeader && (
        <button
          type="submit"
          className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-primary/80 transition-colors hover:bg-secondary/80 hover:text-primary"
          aria-label={submitLabel}
        >
          <SearchIcon aria-hidden className="size-4 shrink-0" />
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
          "flex h-11 w-full min-h-11 max-h-11 min-w-0 shrink-0 items-stretch overflow-hidden rounded-full border border-border/70 bg-background shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-primary/25 focus-within:shadow-md",
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
