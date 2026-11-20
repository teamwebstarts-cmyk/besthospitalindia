"use client"

import type { ReactNode } from "react"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CatalogueStatus } from "@/lib/catalogue/store"

import { AdminCatalogueStatusBar } from "./admin-catalogue-status-bar"
import { AdminListingCardShell } from "./admin-listing-card-shell"

/** Shared admin catalogue grid: 1 → 2 → 3 columns, equal-height rows */
export const adminCatalogueGridClass =
  "grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3"

export function AdminCatalogueCardFrame({
  name,
  status,
  onStatusChange,
  openLabel,
  onOpen,
  onEdit,
  onDelete,
  children,
}: {
  name: string
  status: CatalogueStatus
  onStatusChange: (status: CatalogueStatus) => void
  openLabel: string
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
}) {
  return (
    <li className="flex min-h-[22rem] min-w-0 flex-col">
      <article className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
        <AdminCatalogueStatusBar
          name={name}
          status={status}
          onStatusChange={onStatusChange}
          placement="overlay"
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <AdminListingCardShell label={openLabel} onOpen={onOpen} className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-[15.5rem] flex-1 flex-col [&_.fd-card]:h-full [&_.fh-card]:h-full">
              {children}
            </div>
          </AdminListingCardShell>
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-3 py-2.5">
            <Button type="button" variant="default" size="sm" className="h-8 gap-1 text-xs" onClick={onEdit}>
              <PencilIcon className="size-3.5" aria-hidden />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2Icon className="size-3.5" aria-hidden />
              Delete
            </Button>
          </footer>
        </div>
      </article>
    </li>
  )
}

/** @deprecated Footer is built into AdminCatalogueCardFrame */
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