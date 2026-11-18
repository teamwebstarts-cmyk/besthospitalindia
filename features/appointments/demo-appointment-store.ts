import type { AppointmentRequest, ProviderRefType } from "@/types"

export type DemoAppointmentUpdate = Partial<
  Pick<AppointmentRequest, "status" | "preferredDate" | "note" | "updatedAt">
>

export interface DemoAppointmentSnapshot {
  created: AppointmentRequest[]
  updates: Record<string, DemoAppointmentUpdate>
  activeProviders: Partial<Record<ProviderRefType, string>>
}

const STORAGE_KEY = "bhi.demo-appointments.v1"
export const DEMO_APPOINTMENTS_CHANGED_EVENT = "bhi:demo-appointments-changed"
function emptySnapshot(): DemoAppointmentSnapshot {
  return { created: [], updates: {}, activeProviders: {} }
}

export function readDemoAppointmentSnapshot(): DemoAppointmentSnapshot {
  if (typeof window === "undefined") return emptySnapshot()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySnapshot()
    const parsed = JSON.parse(raw) as Partial<DemoAppointmentSnapshot>
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updates: parsed.updates && typeof parsed.updates === "object" ? parsed.updates : {},
      activeProviders:
        parsed.activeProviders && typeof parsed.activeProviders === "object"
          ? parsed.activeProviders
          : {},
    }
  } catch {
    return emptySnapshot()
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

/** Save a new request and make its target the active demo provider for that portal. */
export function saveDemoAppointmentRequest(request: AppointmentRequest): boolean {
  const snapshot = readDemoAppointmentSnapshot()
  const existingIndex = snapshot.created.findIndex((item) => item.id === request.id)
  if (existingIndex >= 0) snapshot.created[existingIndex] = request
  else snapshot.created = [request, ...snapshot.created]
  snapshot.activeProviders[request.providerType] = request.providerId
  return writeSnapshot(snapshot)
}

/** Change which fixture account the user is previewing in a partner portal. */
export function setActiveDemoProvider(providerType: ProviderRefType, providerId: string): void {
  const snapshot = readDemoAppointmentSnapshot()
  snapshot.activeProviders[providerType] = providerId
  writeSnapshot(snapshot)
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
