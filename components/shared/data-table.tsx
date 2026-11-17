"use client"

import * as React from "react"

import { Pagination } from "@/components/shared/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Column definition. `render` receives the row and returns the cell
 * content; without it the row value at `key` renders as a string.
 */
export interface DataTableColumn<T> {
  /** Row property key this column reads from. */
  key: string
  /** Column header label. */
  header: string
  /** Optional custom cell renderer. */
  render?: (row: T) => React.ReactNode
  /** Optional extra classes for header + cells of this column. */
  className?: string
  /** Visually hide the header (e.g. icon-only action columns). */
  hideHeader?: boolean
}

export interface DataTablePaginationProps {
  /** Controlled current page (1-based). */
  page: number
  /** Total pages across the full data set. */
  totalPages: number
  /** Called when the user selects a page. */
  onPageChange: (page: number) => void
}

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  /** Stable row identity; defaults to the row index. */
  getRowKey?: (row: T, index: number) => string
  /** Message shown when `rows` is empty. */
  emptyMessage?: string
  /** Icon shown in the empty row (lucide name via component). */
  emptyIcon?: React.ComponentType<{ className?: string }>
  /** Optional built-in pagination, rendered below the table. */
  pagination?: DataTablePaginationProps
  className?: string
}

/**
 * Generic, typed table for portal/admin listings.
 *
 * - Responsive: horizontal scroll container at small widths.
 * - No-data: renders a single full-width row with `emptyMessage`
 *   (default "No records found").
 * - Optional built-in pagination wired to the shared Pagination.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "No records found",
  emptyIcon: EmptyIcon,
  pagination,
  className,
}: DataTableProps<T>) {
  const hasColumns = columns.length > 0

  if (!hasColumns) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-surface px-4 py-12 text-center text-sm text-muted-foreground",
          className
        )}
        role="status"
      >
        No columns defined.
      </div>
    )
  }

  const isEmpty = rows.length === 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.className, column.hideHeader && "sr-only")}
                  scope="col"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {EmptyIcon ? (
                      <EmptyIcon className="size-6 text-muted-foreground/70" />
                    ) : null}
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={getRowKey ? getRowKey(row, index) : index}>
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[column.key]
                    const content = column.render
                      ? column.render(row)
                      : value === undefined || value === null
                        ? "—"
                        : String(value)

                    return (
                      <TableCell key={column.key} className={column.className}>
                        {content}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          className="justify-end"
        />
      ) : null}
    </div>
  )
}
