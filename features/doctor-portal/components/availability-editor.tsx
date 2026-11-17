"use client"

/**
 * AvailabilityEditor — /doctor-portal/availability (pages/60).
 *
 * Weekly editor per spec: toggle days on/off, add/remove time ranges, validate
 * order and overlap, add named demo slots. State is local-only (see
 * features/doctor-portal/availability.ts for the mock contract rationale — the
 * A01 fixture layer has no availability entity and A10 must not extend it).
 *
 * Responsive per spec: the week grid collapses to a stacked agenda on narrow
 * screens; every control keeps a visible label and keyboard focus ring. No
 * real booking calendar is created or implied.
 */

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/shared/empty-state"
import {
  configuredDayCount,
  emptyWeek,
  firstWeekError,
  timeToMinutes,
  validateSlot,
  WEEKDAYS,
  WEEKDAY_LABELS,
  type TimeRange,
  type WeekAvailability,
  type Weekday,
} from "@/features/doctor-portal/availability"
import { cn } from "@/lib/utils"

export interface AvailabilityEditorProps {
  className?: string
}

interface DraftSlot {
  start: string
  end: string
}

/** One day card: enable toggle, range rows, add-range control. */
function DayCard({
  day,
  value,
  onChange,
}: {
  day: Weekday
  value: WeekAvailability[Weekday]
  onChange: (next: WeekAvailability[Weekday]) => void
}) {
  const [draft, setDraft] = useState<DraftSlot>({ start: "", end: "" })
  const [draftError, setDraftError] = useState<string | null>(null)

  const enabled = value.ranges.length > 0

  function patchRange(index: number, patch: Partial<TimeRange>) {
    const ranges = value.ranges.map((range, i) =>
      i === index ? { ...range, ...patch } : range,
    )
    onChange({ ...value, ranges })
    setDraftError(null)
  }

  function addRange() {
    const start = draft.start.trim()
    const end = draft.end.trim()
    const result = validateSlot(value, { start, end })
    if (!result.ok) {
      setDraftError(result.message ?? "This time range is not valid.")
      return
    }
    onChange({ ...value, ranges: [...value.ranges, { start, end }] })
    setDraft({ start: "", end: "" })
    setDraftError(null)
  }

  function removeRange(index: number) {
    onChange({ ...value, ranges: value.ranges.filter((_, i) => i !== index) })
    setDraftError(null)
  }

  function toggleDay(checked: boolean) {
    if (checked) {
      onChange({ ...value, ranges: [{ start: "09:00", end: "13:00" }] })
    } else {
      onChange({ ...value, ranges: [] })
    }
    setDraftError(null)
  }

  const sortedRanges = value.ranges
    .map((range, index) => ({ range, index }))
    .sort((a, b) => timeToMinutes(a.range.start) - timeToMinutes(b.range.start))

  return (
    <Card
      size="sm"
      data-day={day}
      className={cn("gap-3", !enabled && "bg-muted/30")}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id={`availability-${day}-enabled`}
              checked={enabled}
              onCheckedChange={(checked) => toggleDay(checked === true)}
              aria-label={`Configure ${WEEKDAY_LABELS[day]}`}
            />
            <Label htmlFor={`availability-${day}-enabled`} className="text-sm font-semibold">
              {WEEKDAY_LABELS[day]}
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {enabled ? `${value.ranges.length} window${value.ranges.length === 1 ? "" : "s"}` : "Closed"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="gap-3">
        {enabled ? (
          <>
            {sortedRanges.length > 0 ? (
              <ul className="space-y-2" aria-label={`${WEEKDAY_LABELS[day]} consulting windows`}>
                {sortedRanges.map(({ range, index }) => (
                  <li key={index} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label
                        htmlFor={`availability-${day}-${index}-start`}
                        className="text-xs text-muted-foreground"
                      >
                        From
                      </Label>
                      <Input
                        id={`availability-${day}-${index}-start`}
                        type="time"
                        value={range.start}
                        onChange={(event) => patchRange(index, { start: event.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label
                        htmlFor={`availability-${day}-${index}-end`}
                        className="text-xs text-muted-foreground"
                      >
                        To
                      </Label>
                      <Input
                        id={`availability-${day}-${index}-end`}
                        type="time"
                        value={range.end}
                        onChange={(event) => patchRange(index, { end: event.target.value })}
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeRange(index)}
                      aria-label={`Remove ${range.start}–${range.end} on ${WEEKDAY_LABELS[day]}`}
                    >
                      ×
                      <span className="sr-only">Remove window</span>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enabled with no windows — add at least one time range below.
              </p>
            )}

            <div className="rounded-md border border-dashed p-2.5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Add a window</p>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <Label htmlFor={`availability-${day}-new-start`} className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id={`availability-${day}-new-start`}
                    type="time"
                    value={draft.start}
                    onChange={(event) => {
                      setDraft((previous) => ({ ...previous, start: event.target.value }))
                      setDraftError(null)
                    }}
                    className="w-full"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <Label htmlFor={`availability-${day}-new-end`} className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id={`availability-${day}-new-end`}
                    type="time"
                    value={draft.end}
                    onChange={(event) => {
                      setDraft((previous) => ({ ...previous, end: event.target.value }))
                      setDraftError(null)
                    }}
                    className="w-full"
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRange}>
                  Add
                </Button>
              </div>
              {draftError ? (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  {draftError}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`availability-${day}-note`} className="text-xs text-muted-foreground">
                Day note (demo)
              </Label>
              <Input
                id={`availability-${day}-note`}
                value={value.note}
                onChange={(event) => onChange({ ...value, note: event.target.value })}
                placeholder='e.g. "Hospital OPD only (demo)"'
                className="w-full"
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Marked closed. Tick the checkbox to open the day with a default morning window.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function AvailabilityEditor({ className }: AvailabilityEditorProps) {
  const [week, setWeek] = useState<WeekAvailability>(emptyWeek)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const weekError = firstWeekError(week)
  const days = configuredDayCount(week)

  function handleSave() {
    if (weekError) {
      setSavedMessage(null)
      return
    }
    setSavedMessage(
      days === 0
        ? "Demo week saved locally as fully closed. Nothing was stored — reloading resets this page."
        : `Demo week saved locally: ${days} configured day${days === 1 ? "" : "s"}. Nothing was stored — reloading resets this page.`,
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {days === 0
            ? "No days configured yet — the demo week is fully closed."
            : `${days} of 7 days configured.`}
          {weekError ? (
            <span className="mt-1 block font-medium text-destructive">{weekError}</span>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setWeek(emptyWeek())
              setSavedMessage(null)
            }}
          >
            Reset week
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={weekError !== null}>
            Save week (demo)
          </Button>
        </div>
      </div>

      {savedMessage ? (
        <p
          role="status"
          className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {savedMessage}
        </p>
      ) : null}

      {days === 0 ? (
        <EmptyState
          title="The demo week is empty"
          description="Tick a day below to open it with a default morning window, then adjust times or add more windows. Everything stays on this page."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WEEKDAYS.map((day) => (
          <DayCard
            key={day}
            day={day}
            value={week[day]}
            onChange={(next) => setWeek((previous) => ({ ...previous, [day]: next }))}
          />
        ))}
      </div>
    </div>
  )
}
