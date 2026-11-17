"use client"

import { CircleExclamationPointIcon, RefreshCwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  /** Short heading; defaults to "Something went wrong". */
  title?: string
  /** Supporting message. Defaults to a generic retry hint. */
  description?: string
  /** Optional retry callback; renders a retry button when provided. */
  onRetry?: () => void
  /** Label for the retry button. */
  retryLabel?: string
  className?: string
}

/**
 * Alert-based error summary with an optional retry action.
 * Renders a neutral, user-safe message (never raw error text).
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("items-start", className)}>
      <CircleExclamationPointIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {onRetry ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            <RefreshCwIcon data-icon="inline-start" />
            {retryLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
