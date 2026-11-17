/**
 * Demo session helpers — hospital partner portal (A09).
 *
 * Separate from demo-context.ts so client components can import a tiny module
 * without pulling server-oriented selector code into the client bundle.
 */

import { getDemoPartnerUser } from "@/features/hospital-portal/demo-context"

/** Demo partner user, null-safe for client rendering. */
export function getDemoPartnerUserSafe() {
  try {
    return getDemoPartnerUser()
  } catch {
    return null
  }
}
