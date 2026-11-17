"use client"

import { useEffect } from "react"
import Link from "next/link"

import { ErrorState } from "@/components/shared/error-state"

export interface HospitalPortalErrorProps {
  error: unknown
  retry: () => void
}

/**
 * Hospital-portal segment error boundary (Next.js 16 `error` + `retry`).
 * Portal-scoped copy keeps the demo workspace context and a way back to the
 * dashboard without leaking error details.
 */
export default function HospitalPortalError({ error, retry }: HospitalPortalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-xl py-10">
      <ErrorState
        title="This portal section ran into a problem"
        description="Something went wrong while loading this hospital portal section in the demo workspace. Try again, or return to the dashboard."
        onRetry={retry}
        retryLabel="Retry this section"
      />
      <div className="mt-4 text-center">
        <Link
          href="/hospital-portal"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
