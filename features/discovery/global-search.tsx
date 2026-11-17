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

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={className}
    >
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="w-full sm:w-44">
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
              className="w-full"
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
        </div>
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label className="sr-only" htmlFor={queryFieldId}>
            {queryLabel}
          </label>
          <Input
            id={queryFieldId}
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, city or service…"
            className="pl-9"
          />
        </div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
