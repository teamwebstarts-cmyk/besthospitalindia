import "server-only"

export type PartnerOtpPurpose = "register" | "signin"

export function normalizePartnerEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Stable outbox key for partner email codes (before a submission id exists). */
export function partnerOtpLeadId(email: string, purpose: PartnerOtpPurpose): string {
  return `partner:${purpose}:${normalizePartnerEmail(email)}`
}