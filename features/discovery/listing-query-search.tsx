"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  buildFilterQueryString,
  type DiscoveryFilterValues,
} from "@/features/discovery/types"

const DEFAULT_DEBOUNCE_MS = 300

export interface ListingQuerySearchProps {
  basePath: string
  /** Current ?q= from the URL (server truth). */
  initialQuery: string
  /** Active facet values — preserved when ?q= changes; `q` is omitted on navigate. */
  filterValues: DiscoveryFilterValues
  /** Scalar params preserved across query changes (e.g. sort). `page` must not be included. */
  extraParams?: Record<string, string | undefined>
  debounceMs?: number
  /** Accessible name for the search region. */
  ariaLabel: string
  placeholder: string
  /** Unique id for the input + label association. */
  inputId: string
  className?: string
}

export function ListingQuerySearch({
  basePath,
  initialQuery,
  filterValues,
  extraParams,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  ariaLabel,
  placeholder,
  inputId,
  className,
}: ListingQuerySearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState(initialQuery)
  const filterValuesRef = React.useRef(filterValues)
  const extraParamsRef = React.useRef(extraParams)
  filterValuesRef.current = filterValues
  extraParamsRef.current = extraParams

  React.useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  React.useEffect(() => {
    const trimmed = query.trim()
    const currentTrimmed = initialQuery.trim()
    if (trimmed === currentTrimmed) return

    const timeoutId = window.setTimeout(() => {
      const valuesWithoutQuery = { ...filterValuesRef.current }
      delete valuesWithoutQuery.q

      const href = `${basePath}${buildFilterQueryString(valuesWithoutQuery, {
        ...extraParamsRef.current,
        ...(trimmed ? { q: trimmed } : {}),
      })}`
      router.replace(href)
    }, debounceMs)

    return () => window.clearTimeout(timeoutId)
  }, [basePath, debounceMs, initialQuery, query, router])

  return (
    <form
      role="search"
      aria-label={ariaLabel}
      className={cn("relative w-full", className)}
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-10 w-full pr-3 pl-9"
      />
      <p className="sr-only" aria-live="polite">
        Results update as you type.
      </p>
    </form>
  )
}