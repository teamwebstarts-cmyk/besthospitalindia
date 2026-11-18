"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/shared/error-state"

export interface AdminPortalErrorProps {
  error: unknown
  retry: () => void
}

/**
 * /admin error boundary (Next.js 16 `retry` prop per the bundled docs).
 * Renders inside the portal shell so the nav rail stays usable after a
 * segment error, and never surfaces raw error text.
 */
export default function AdminPortalError({ error, retry }: AdminPortalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="space-y-6 py-8">
      <ErrorState
        title="This admin section ran into a problem"
        description="Something went wrong while loading this part of the admin portal. Demo data was not affected — try again."
        onRetry={retry}
      />
    </div>
  )
}
