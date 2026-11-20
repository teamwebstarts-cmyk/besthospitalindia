"use client"

import { cn } from "@/lib/utils"
import type { CatalogueStatus } from "@/lib/catalogue/store"

export type AdminListingTab = "all" | CatalogueStatus

const TAB_LABELS: Record<AdminListingTab, string> = {
  all: "All",
  approved: "Approved",
  pending: "Waiting approval",
  rejected: "Rejected",
}

export function AdminListingTabs({
  value,
  onChange,
  counts,
}: {
  value: AdminListingTab
  onChange: (tab: AdminListingTab) => void
  counts: Record<AdminListingTab, number>
}) {
  const tabs: AdminListingTab[] = ["all", "pending", "approved", "rejected"]

  return (
    <div
      role="tablist"
      aria-label="Filter listings by approval status"
      className="flex flex-wrap gap-1 rounded-lg border border-border/70 bg-muted/40 p-1"
    >
      {tabs.map((tab) => {
        const selected = value === tab
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB_LABELS[tab]}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                tab === "pending" && counts.pending > 0 && "bg-amber-500/15 text-amber-800 dark:text-amber-200",
              )}
            >
              {counts[tab]}
            </span>
          </button>
        )
      })}
    </div>
  )
}