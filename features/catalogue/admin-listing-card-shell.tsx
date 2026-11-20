"use client"

import type { ReactNode } from "react"

/** Opens admin detail edit when the preview card is clicked; blocks navigation to the public site. */
import { cn } from "@/lib/utils"

export function AdminListingCardShell({
  label,
  onOpen,
  children,
  className,
}: {
  label: string
  onOpen: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="[&_a]:pointer-events-none">{children}</div>
      <button
        type="button"
        className="absolute inset-0 z-[2] rounded-xl border-0 bg-transparent p-0 ring-offset-background hover:ring-2 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={label}
        onClick={onOpen}
      />
    </div>
  )
}