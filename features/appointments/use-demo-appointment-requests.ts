"use client"

import { useEffect, useMemo, useState } from "react"
import type { AppointmentRequest } from "@/types"
import {
  DEMO_APPOINTMENTS_CHANGED_EVENT,
  readDemoAppointmentSnapshot,
  type DemoAppointmentSnapshot,
} from "./demo-appointment-store"

const EMPTY_SNAPSHOT: DemoAppointmentSnapshot = {
  created: [],
  updates: {},
  activeProviders: {},
}

/**
 * Combines fixture requests with demo bookings saved in this browser profile.
 * This is local UI state only, not a backend or cross-device data store.
 */
export function useDemoAppointmentRequests(
  initialRequests: readonly AppointmentRequest[],
  include: (request: AppointmentRequest) => boolean = () => true,
): AppointmentRequest[] {
  const [snapshot, setSnapshot] = useState<DemoAppointmentSnapshot>(EMPTY_SNAPSHOT)

  useEffect(() => {
    const refresh = () => setSnapshot(readDemoAppointmentSnapshot())
    refresh()
    window.addEventListener(DEMO_APPOINTMENTS_CHANGED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(DEMO_APPOINTMENTS_CHANGED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  return useMemo(() => {
    const merged: AppointmentRequest[] = initialRequests.map((request) => ({
      ...request,
      ...(snapshot.updates[request.id] ?? {}),
    }))
    const knownIds = new Set(merged.map((request) => request.id))
    for (const request of snapshot.created) {
      if (!knownIds.has(request.id)) merged.push(request)
    }
    return merged.filter(include)
  }, [initialRequests, include, snapshot])
}
