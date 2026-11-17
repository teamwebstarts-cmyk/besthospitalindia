import type { Metadata } from "next"
import type { ReactNode } from "react"

import { HospitalPortalShell } from "@/features/hospital-portal/hospital-portal-shell"

/**
 * Hospital partner portal layout (A09).
 *
 * Route segment: `app/hospital-portal/*` per 02-page-inventory (11 paths).
 * Renders the shared PortalShell (sidebar rail / mobile drawer + topbar with
 * the demo-portal notice) via the client wrapper HospitalPortalShell.
 *
 * Metadata: portals stay out of public SEO per 10-routing-and-layouts.md —
 * `robots: { index: false }` and no leakage of portal details into titles.
 */
export const metadata: Metadata = {
  title: {
    default: "Hospital Portal",
    template: "%s | Hospital Portal",
  },
  description: "Hospital partner demo workspace (mock data only).",
  robots: { index: false, follow: false },
}

export default function HospitalPortalLayout({ children }: { children: ReactNode }) {
  return <HospitalPortalShell>{children}</HospitalPortalShell>
}
