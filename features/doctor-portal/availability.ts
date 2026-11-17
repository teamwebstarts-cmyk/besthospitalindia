/**
 * Availability store for the Doctor Portal (A10) — local mock state contract.
 *
 * The A01 fixture layer has no availability entity (types/, data/ are
 * A01-owned and frozen; pages/60 lists an "Availability fixture" but the data
 * contract agent shipped none). Per the A10 ownership rules I must not add
 * fields to A01 fixtures, so the availability editor keeps its state in local
 * component state with this typed shape as the module's mock contract. Nothing
 * is persisted anywhere — reloading the page restores the empty default, which
 * the UI states honestly ("not saved anywhere").
 *
 * Rules (pages/60 "Specific acceptance"):
 * - validate time order (start < end, within 00:00–24:00)
 * - prevent overlapping slots within a day
 * - no real booking calendar, no real scheduling effect
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimeRange {
  /** HH:MM 24-h. */
  start: string
  /** HH:MM 24-h, strictly after start. */
  end: string
}

export interface DayAvailability {
  /** Consulting windows for this weekday; empty = closed. */
  ranges: TimeRange[]
  /** Free-text demo note (e.g. "hospital OPD only (demo)"). */
  note: string
}

/** Monday-first week keys, matching the editor's day order. */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type WeekAvailability = Record<Weekday, DayAvailability>

export const WEEKDAYS: readonly Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

/** An empty week: every day closed with no ranges. */
export function emptyWeek(): WeekAvailability {
  return {
    mon: { ranges: [], note: "" },
    tue: { ranges: [], note: "" },
    wed: { ranges: [], note: "" },
    thu: { ranges: [], note: "" },
    fri: { ranges: [], note: "" },
    sat: { ranges: [], note: "" },
    sun: { ranges: [], note: "" },
  }
}

// ---------------------------------------------------------------------------
// Validation — pure, shared by the editor UI and its submit handler
// ---------------------------------------------------------------------------

const HHMM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** "14:30" → minutes since midnight; NaN when malformed. */
export function timeToMinutes(time: string): number {
  if (!HHMM_PATTERN.test(time)) return Number.NaN
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export interface SlotValidationResult {
  ok: boolean
  /** Human-readable message when not ok. */
  message?: string
}

/**
 * Validate one proposed slot against a day's existing ranges:
 * well-formed, ordered (start < end), and non-overlapping.
 */
export function validateSlot(
  day: DayAvailability,
  proposed: TimeRange,
  ignoreIndex?: number,
): SlotValidationResult {
  const start = timeToMinutes(proposed.start)
  const end = timeToMinutes(proposed.end)

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { ok: false, message: "Use HH:MM 24-hour times, e.g. 09:30." }
  }
  if (start >= end) {
    return { ok: false, message: "Start time must be earlier than end time." }
  }
  for (let i = 0; i < day.ranges.length; i += 1) {
    if (i === ignoreIndex) continue
    const existingStart = timeToMinutes(day.ranges[i].start)
    const existingEnd = timeToMinutes(day.ranges[i].end)
    if (Number.isNaN(existingStart) || Number.isNaN(existingEnd)) continue
    if (start < existingEnd && end > existingStart) {
      return {
        ok: false,
        message: `Overlaps ${day.ranges[i].start}–${day.ranges[i].end} on this day.`,
      }
    }
  }
  return { ok: true }
}

/** First problem across a whole week, or null when the week is valid. */
export function firstWeekError(week: WeekAvailability): string | null {
  for (const day of WEEKDAYS) {
    for (let i = 0; i < week[day].ranges.length; i += 1) {
      const result = validateSlot(week[day], week[day].ranges[i], i)
      if (!result.ok) {
        return `${WEEKDAY_LABELS[day]} ${week[day].ranges[i].start}–${week[day].ranges[i].end}: ${result.message}`
      }
    }
  }
  return null
}

/** Number of days with at least one range (dashboard summary metric). */
export function configuredDayCount(week: WeekAvailability): number {
  return WEEKDAYS.filter((day) => week[day].ranges.length > 0).length
}

/** Total consulting hours across the week, rounded to 1 decimal. */
export function weeklyHourCount(week: WeekAvailability): number {
  let minutes = 0
  for (const day of WEEKDAYS) {
    for (const range of week[day].ranges) {
      const start = timeToMinutes(range.start)
      const end = timeToMinutes(range.end)
      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        minutes += end - start
      }
    }
  }
  return Math.round((minutes / 60) * 10) / 10
}
