"use client"

import { ListingQuerySearch, type ListingQuerySearchProps } from "@/features/discovery/listing-query-search"

export type DoctorListingSearchProps = Omit<
  ListingQuerySearchProps,
  "ariaLabel" | "placeholder" | "inputId"
> & {
  sort: string
  defaultSort?: string
}

/** Doctor directory — debounced ?q= search preserving facets and sort. */
export function DoctorListingSearch({
  sort,
  defaultSort = "name-asc",
  ...props
}: DoctorListingSearchProps) {
  return (
    <ListingQuerySearch
      key={`${props.basePath}:${props.initialQuery}`}
      {...props}
      extraParams={{
        ...props.extraParams,
        ...(sort !== defaultSort ? { sort } : {}),
      }}
      ariaLabel="Search doctors"
      placeholder="Search by name, specialty or hospital…"
      inputId="doctor-listing-search"
    />
  )
}