"use client"

import { ListingQuerySearch, type ListingQuerySearchProps } from "@/features/discovery/listing-query-search"

export type HospitalListingSearchProps = Omit<
  ListingQuerySearchProps,
  "ariaLabel" | "placeholder" | "inputId"
> & {
  sort?: string
}

/** Hospital directory — debounced ?q= search preserving facets and sort. */
export function HospitalListingSearch({ sort, ...props }: HospitalListingSearchProps) {
  return (
    <ListingQuerySearch
      key={`${props.basePath}:${props.initialQuery}`}
      {...props}
      extraParams={{
        ...props.extraParams,
        ...(sort ? { sort } : {}),
      }}
      ariaLabel="Search hospitals"
      placeholder="Search by hospital name, city or specialty…"
      inputId="hospital-listing-search"
    />
  )
}