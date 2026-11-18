"use client"

/**
 * AdminPortalShell — client shell for the admin portal (A11).
 *
 * The shared `PortalShell` (A00) is a Server Component that takes
 * `items: PortalNavEntry[]` — items may carry lucide icon components, and
 * component references cannot cross the server→client boundary as props.
 * The admin layout therefore renders this thin client wrapper, which imports
 * the frozen `adminNavGroups` registry directly and composes the shared
 * shell — the exact pattern A09 (HospitalPortalShell) and A10
 * (DoctorPortalShell) established.
 *
 * The navigation groups, hrefs and labels are consumed unchanged from
 * `constants/navigation.ts` (A00-owned); grouping is presentation-only.
 */

import type { ReactNode } from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { adminNavGroups } from "@/constants/navigation"
import { AdminUserChip } from "@/features/admin/components/admin-user-chip"

export interface AdminPortalShellProps {
  children: ReactNode
}

export function AdminPortalShell({ children }: AdminPortalShellProps) {
  return (
    <PortalShell
      items={adminNavGroups}
      title="Admin Portal"
      description="Super admin workspace — fictional demo data only"
      actions={<AdminUserChip />}
    >
      {children}
    </PortalShell>
  )
}
