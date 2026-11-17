/**
 * Topbar identity slot for the Doctor Portal (A10).
 *
 * Rendered into PortalShell's `actions` slot. Demo-only: there is no session,
 * no avatar upload and no account — this is a labelled fixture identity so the
 * portal shows role context (10-routing-and-layouts.md, "Portal routes should
 * show role context").
 */

import { ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export function PortalUserChip() {
  const doctor = getSessionDoctor()

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <ShieldCheckIcon aria-hidden className="size-3" />
        Doctor partner (demo)
      </Badge>
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <UserRoundIcon aria-hidden className="size-4 text-muted-foreground" />
        {doctor ? doctor.name : "Demo doctor (fictional)"}
      </span>
    </div>
  )
}
