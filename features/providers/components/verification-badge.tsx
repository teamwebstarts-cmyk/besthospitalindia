/**
 * VerificationBadge — verification state chip for providers and accreditations
 * (Agent A04). Contract source: implementation/08-component-catalog.md —
 * "Verified/pending/rejected/expired only from mock status".
 *
 * Rules:
 * - The label is derived ONLY from the mock `VerificationStatus` value; the
 *   component never asserts "verified" without a `verified` record.
 * - Accreditations share the same status vocabulary (`Accreditation.status`),
 *   so the same tone mapping applies there.
 * - Optional `label` override is display-only; callers still pass the real
 *   status so the tone always reflects the underlying mock state.
 */

import { StatusBadge, type StatusTone } from "@/components/shared/status-badge"
import type { VerificationStatus } from "@/types"

/**
 * Verification status → semantic tone. Mirrors the shared STATUS_TONES map so
 * the badge stays consistent with portal surfaces:
 * verified → success, pending → warning, rejected/expired → danger,
 * unverified → neutral. Unknown values fall back to neutral via StatusBadge.
 */
export const VERIFICATION_TONES: Record<VerificationStatus, StatusTone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  expired: "danger",
  unverified: "neutral",
}

export interface VerificationBadgeProps {
  /** Mock verification status — the single source of truth for label and tone. */
  status: VerificationStatus
  /** Optional display label override (defaults to a humanized status). */
  label?: string
  className?: string
}

export function VerificationBadge({ status, label, className }: VerificationBadgeProps) {
  return <StatusBadge status={status} label={label} tone={VERIFICATION_TONES[status]} className={className} />
}
