"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/shared/error-state"

export interface ErrorBoundaryProps {
  error: unknown
  retry: () => void
}

/**
 * Route segment error boundary (Next.js 16: `error` + `retry` props).
 * Logs the error and renders a safe, retryable fallback.
 */
export default function Error({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ErrorState
        title="This page ran into a problem"
        description="Something went wrong while loading this section. Your data is safe — try again."
        onRetry={retry}
      />
    </div>
  )
}
