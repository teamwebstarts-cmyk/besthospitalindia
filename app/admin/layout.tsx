import type { Metadata } from "next"

import { AdminLogin } from "@/features/admin/admin-login"
import { AdminPortalShell } from "@/features/admin/admin-portal-shell"
import { hasAdminSession } from "@/lib/admin/session"

/**
 * Admin Portal layout (A11) — wraps every /admin route in the shared A00
 * PortalShell via the AdminPortalShell client wrapper: grouped admin nav rail
 * (desktop) + Sheet drawer (mobile) + topbar with the demo-portal notice and
 * the super-admin identity chip. Same pattern as the A09 hospital portal and
 * A10 doctor portal layouts.
 *
 * Admin sign-in is required before the shell or any patient query is shown.
 */

export const metadata: Metadata = {
  // 10-routing-and-layouts.md: "Avoid leaking private portal details into
  // public page metadata" — generic portal title, no fixture identity.
  title: {
    default: "Admin Portal",
    template: "%s | Admin Portal",
  },
  description:
    "BestHospitalIndia admin portal (demo): platform dashboard plus hospital, doctor, facility, patient and partner management with verification queues. Mock data only.",
  robots: { index: false, follow: false },
}

export default async function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!(await hasAdminSession())) return <AdminLogin />
  return <AdminPortalShell>{children}</AdminPortalShell>
}
