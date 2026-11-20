"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import type { CatalogueStatus } from "@/lib/catalogue/store"

import { AdminCatalogueStatusBar } from "./admin-catalogue-status-bar"
import { AdminListingCardShell } from "./admin-listing-card-shell"

/** Shared admin catalogue grid: 1 → 2 → 3 columns */
export const adminCatalogueGridClass =
  "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"

export function AdminCatalogueCardFrame({
  name,
  status,
  onStatusChange,
  openLabel,
  onOpen,
  children,
  footer,
}: {
  name: string
  status: CatalogueStatus
  onStatusChange: (status: CatalogueStatus) => void
  openLabel: string
  onOpen: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <li className="flex min-w-0 flex-col gap-2">
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
        <AdminCatalogueStatusBar
          name={name}
          status={status}
          onStatusChange={onStatusChange}
          placement="overlay"
        />
        <AdminListingCardShell label={openLabel} onOpen={onOpen}>
          {children}
        </AdminListingCardShell>
      </div>
      {footer ? <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">{footer}</div> : null}
    </li>
  )
}

export function AdminCatalogueCardActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="default" size="sm" className="h-8 text-xs" onClick={onEdit}>
        Edit
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  )
}

/** @deprecated Use AdminCatalogueCardActions */
export function AdminCatalogueCardRemove({ onRemove }: { onRemove: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onRemove}>
      Delete
    </Button>
  )
}