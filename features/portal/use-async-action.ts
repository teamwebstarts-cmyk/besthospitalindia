"use client"

import { useCallback, useRef, useState } from "react"

const SLOW_MS = 2800

export function useAsyncAction() {
  const [pending, setPending] = useState(false)
  const [slow, setSlow] = useState(false)
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSlowTimer = useCallback(() => {
    if (slowTimer.current) {
      clearTimeout(slowTimer.current)
      slowTimer.current = null
    }
  }, [])

  const run = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      setPending(true)
      setSlow(false)
      clearSlowTimer()
      slowTimer.current = setTimeout(() => setSlow(true), SLOW_MS)
      try {
        return await task()
      } finally {
        clearSlowTimer()
        setPending(false)
        setSlow(false)
      }
    },
    [clearSlowTimer],
  )

  return { pending, slow, run }
}