"use client"

import type { ReactNode } from "react"

import type { CatalogueStatus } from "@/lib/catalogue/store"
import { cn } from "@/lib/utils"

const STATUSES: CatalogueStatus[] = ["approved", "pending", "rejected"]

const fieldClass =
  "h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm sm:text-sm"

export function AdminCatalogueStatusBar({
  name,
  status,
  onStatusChange,
  children,
  placement = "inline",
}: {
  name: string
  status: CatalogueStatus
  onStatusChange: (status: CatalogueStatus) => void
  children?: ReactNode
  placement?: "inline" | "overlay"
}) {
  const isOverlay = placement === "overlay"

  return (
    <div
      className={cn(
        isOverlay
          ? "pointer-events-none absolute top-2 right-2 z-[5] [&_select]:pointer-events-auto"
          : "flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2",
      )}
    >
      <select
        className={cn(fieldClass, isOverlay && "max-w-[7.5rem] bg-background/95 backdrop-blur")}
        value={status}
        aria-label={`Publication for ${name}`}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => onStatusChange(event.target.value as CatalogueStatus)}
      >
        {STATUSES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {children && !isOverlay ? children : null}
    </div>
  )
}