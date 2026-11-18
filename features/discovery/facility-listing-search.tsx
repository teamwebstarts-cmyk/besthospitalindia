"use client"

import { ListingQuerySearch, type ListingQuerySearchProps } from "@/features/discovery/listing-query-search"

export type FacilityListingSearchProps = Omit<
  ListingQuerySearchProps,
  "ariaLabel" | "placeholder" | "inputId"
> & {
  sort?: string
  defaultSort?: string
}

/** Facility directory — debounced ?q= search preserving facets and sort. */
export function FacilityListingSearch({
  sort,
  defaultSort = "relevance",
  ...props
}: FacilityListingSearchProps) {
  return (
    <ListingQuerySearch
      {...props}
      extraParams={{
        ...props.extraParams,
        ...(sort && sort !== defaultSort ? { sort } : {}),
      }}
      ariaLabel="Search facilities"
      placeholder="Search by facility name, city or service…"
      inputId="facility-listing-search"
    />
  )
}