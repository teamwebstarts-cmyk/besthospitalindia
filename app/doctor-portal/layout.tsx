import type { Metadata } from "next"

import { DoctorPortalShell } from "@/features/doctor-portal/doctor-portal-shell"

/**
 * Doctor Portal layout (A10) — wraps every /doctor-portal route in the shared
 * A00 PortalShell via the DoctorPortalShell client wrapper: Doctor nav rail
 * (desktop) + Sheet drawer (mobile) + topbar with the demo-portal notice.
 * No `src/` (G-13); layout follows the existing route-group convention of
 * (public)/(auth) and the A09 hospital portal pattern.
 *
 * Mock access posture (10-routing-and-layouts.md): portal guards are mock-only
 * and must be labelled demo-only — the shell topbar renders the "Demo portal —
 * mock data only" badge and the user chip marks the fixture identity. No real
 * auth exists and none is implied.
 */

export const metadata: Metadata = {
  // 10-routing-and-layouts.md: "Avoid leaking private portal details into
  // public page metadata" — generic portal title, no fixture identity, and
  // robots are left to the global default (demo build, no indexing config).
  title: {
    default: "Doctor Portal",
    template: "%s | Doctor Portal",
  },
  description:
    "BestHospitalIndia doctor partner portal (demo): manage your demo profile, hospital associations, availability, appointment requests, consultations, credentials, reviews and settings. Mock data only.",
  robots: { index: false, follow: false },
}

export default function DoctorPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DoctorPortalShell>{children}</DoctorPortalShell>
}
