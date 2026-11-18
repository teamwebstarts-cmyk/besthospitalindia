import type { AppointmentRequest } from "@/types"

export type DemoAppointmentUpdate = Partial<
  Pick<AppointmentRequest, "status" | "preferredDate" | "note" | "updatedAt">
>

export interface DemoAppointmentSnapshot {
  created: AppointmentRequest[]
  updates: Record<string, DemoAppointmentUpdate>
}

const STORAGE_KEY = "bhi.demo-appointments.v1"
export const DEMO_APPOINTMENTS_CHANGED_EVENT = "bhi:demo-appointments-changed"
const EMPTY_SNAPSHOT: DemoAppointmentSnapshot = { created: [], updates: {} }

export function readDemoAppointmentSnapshot(): DemoAppointmentSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SNAPSHOT
    const parsed = JSON.parse(raw) as Partial<DemoAppointmentSnapshot>
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updates: parsed.updates && typeof parsed.updates === "object" ? parsed.updates : {},
    }
  } catch {
    return EMPTY_SNAPSHOT
  }
}

function writeSnapshot(snapshot: DemoAppointmentSnapshot): boolean {
  if (typeof window === "undefined") return false
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    window.dispatchEvent(new Event(DEMO_APPOINTMENTS_CHANGED_EVENT))
    return true
  } catch {
    return false
  }
}

/** Save a new request locally for the selected provider and admin portals. */
export function saveDemoAppointmentRequest(request: AppointmentRequest): boolean {
  const snapshot = readDemoAppointmentSnapshot()
  const existingIndex = snapshot.created.findIndex((item) => item.id === request.id)
  if (existingIndex >= 0) snapshot.created[existingIndex] = request
  else snapshot.created = [request, ...snapshot.created]
  return writeSnapshot(snapshot)
}

/** Persist a demo status/date change so other portal views stay in sync. */
export function updateDemoAppointmentRequest(id: string, update: DemoAppointmentUpdate): void {
  const snapshot = readDemoAppointmentSnapshot()
  const createdIndex = snapshot.created.findIndex((item) => item.id === id)
  if (createdIndex >= 0) {
    snapshot.created[createdIndex] = { ...snapshot.created[createdIndex], ...update }
  } else {
    snapshot.updates[id] = { ...(snapshot.updates[id] ?? {}), ...update }
  }
  writeSnapshot(snapshot)
}
