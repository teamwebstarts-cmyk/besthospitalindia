"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ProviderRefType } from "@/types"
import {
  DEMO_APPOINTMENTS_CHANGED_EVENT,
  readDemoAppointmentSnapshot,
  setActiveDemoProvider,
} from "./demo-appointment-store"

/**
 * Preview selector for the single-browser demo. A booking automatically
 * selects its provider; users can switch to another fixture account manually.
 */
export function useActiveDemoProvider(
  providerType: ProviderRefType,
  fallbackId: string,
  availableIds: readonly string[],
) {
  const [providerId, setProviderId] = useState(fallbackId)
  const availableIdsKey = availableIds.join("|")
  const availableIdSet = useMemo(
    () => new Set(availableIdsKey.split("|")),
    [availableIdsKey],
  )

  useEffect(() => {
    const refresh = () => {
      const storedId = readDemoAppointmentSnapshot().activeProviders[providerType]
      setProviderId(
        storedId && availableIdSet.has(storedId)
          ? storedId
          : fallbackId,
      )
    }
    refresh()
    window.addEventListener(DEMO_APPOINTMENTS_CHANGED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(DEMO_APPOINTMENTS_CHANGED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [providerType, fallbackId, availableIdSet])

  const selectProvider = useCallback(
    (nextId: string) => {
      if (!availableIdSet.has(nextId)) return
      setActiveDemoProvider(providerType, nextId)
      setProviderId(nextId)
    },
    [providerType, availableIdSet],
  )

  return { providerId, selectProvider }
}
