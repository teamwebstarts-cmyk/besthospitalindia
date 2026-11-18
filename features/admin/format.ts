/**
 * Deterministic demo date/time formatting for the Admin Portal (A11).
 *
 * Fixtures carry ISO strings; the portal renders them in a fixed locale
 * (en-GB, explicit options) so server and client renders agree — same
 * hydration-safe pattern as the A09/A10 portals (no default-locale drift).
 */

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
}

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTIONS,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}

/** "17 Nov 2026" — or the fallback when the value is missing/invalid. */
export function formatDate(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return fallback
  return new Intl.DateTimeFormat("en-GB", DATE_OPTIONS).format(parsed)
}

/** "17 Nov 2026, 14:30" — for created/updated/reviewed timestamps. */
export function formatDateTime(iso: string | null | undefined, fallback = "—"): string {
  if (!iso) return fallback
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return fallback
  return new Intl.DateTimeFormat("en-GB", DATETIME_OPTIONS).format(parsed)
}
