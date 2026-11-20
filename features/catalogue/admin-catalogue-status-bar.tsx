"use client"

import type { ReactNode } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CatalogueStatus } from "@/lib/catalogue/store"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: CatalogueStatus; label: string }[] = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
]

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
          ? "pointer-events-none absolute top-2 right-2 z-[5] [&_button]:pointer-events-auto"
          : "flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2",
      )}
    >
      <Select
        value={status}
        onValueChange={(next) => {
          if (next) onStatusChange(next as CatalogueStatus)
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Publication status for ${name}`}
          className={cn(
            "pointer-events-auto h-8 w-[10.5rem] text-xs shadow-sm",
            isOverlay && "border-border/80 bg-background/95 backdrop-blur",
            status === "pending" && "border-amber-500/50",
            status === "approved" && "border-primary/30",
            status === "rejected" && "border-destructive/40",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {children && !isOverlay ? children : null}
    </div>
  )
}