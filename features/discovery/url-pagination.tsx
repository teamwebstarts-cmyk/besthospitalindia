"use client"

/**
 * UrlPagination — shared discovery shell (A03).
 *
 * Thin client wrapper around the shared Pagination primitive for Server
 * Component listing pages: keeps ?page= in the URL while preserving all
 * filter params (and ?sort=). Functions cannot cross the server→client
 * boundary, so server pages pass data-only props and this component builds
 * the hrefs.
 */

import { Pagination } from "@/components/shared/pagination"
import { DIRECTORY_DEFAULT_PAGE_SIZE } from "@/features/discovery/directory-page-size"
import { buildFilterQueryString } from "@/features/discovery/types"
import type { UrlPaginationProps } from "@/features/discovery/types"

export function UrlPagination({
  page,
  totalPages,
  basePath,
  values,
  sort,
  pageSize = DIRECTORY_DEFAULT_PAGE_SIZE,
  className,
}: UrlPaginationProps) {
  const buildHref = (targetPage: number) =>
    `${basePath}${buildFilterQueryString(values, {
      ...(sort ? { sort } : {}),
      ...(pageSize !== DIRECTORY_DEFAULT_PAGE_SIZE ? { per: String(pageSize) } : {}),
      page: String(targetPage),
    })}`

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      buildHref={buildHref}
      className={className}
    />
  )
}
