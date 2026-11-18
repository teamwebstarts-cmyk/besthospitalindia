import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export interface DemoNoticeProps {
  /** Optional heading override. */
  title?: string
  /** Optional message override. */
  message?: string
  className?: string
}

/**
 * Persistent mock-only notice for pages/forms whose submission is simulated.
 * Demo forms pair this with an explicit inline confirmation state after
 * submit — never a toast.
 */
export function DemoNotice({ title, message, className }: DemoNoticeProps) {
  return (
    <Alert className={className}>
      <InfoIcon aria-hidden />
      <AlertTitle>{title ?? "Before you submit"}</AlertTitle>
      <AlertDescription>
        {message ??
          "Use this form to reach our team. Scope, eligibility and response times are described on this page."}
      </AlertDescription>
    </Alert>
  )
}

/** State for the inline feedback panel under a mock form. */
export type DemoFormFeedbackState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; headline: string; lines: readonly string[] }
  | { kind: "error"; headline: string; lines: readonly string[] }

export interface DemoFormFeedbackProps {
  state: DemoFormFeedbackState
  className?: string
}

/**
 * Visible inline submit feedback for mock forms (no toasts in this build):
 * - submitting: busy line while the simulated latency resolves;
 * - success: mock reference and "no backend" boundary lines;
 * - error: validation failure headline; field-level errors render inline next
 *   to their inputs.
 */
export function DemoFormFeedback({ state, className }: DemoFormFeedbackProps) {
  if (state.kind === "idle") return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        state.kind === "success" &&
          "border-success/40 bg-success/10 text-success",
        state.kind === "error" &&
          "border-destructive/40 bg-destructive/10 text-destructive",
        state.kind === "submitting" && "bg-muted text-muted-foreground",
        className
      )}
    >
      <p className="font-medium">
        {state.kind === "submitting"
          ? "Submitting…"
          : state.kind === "success"
            ? state.headline
            : state.headline}
      </p>
      {state.kind !== "submitting" && state.lines.length > 0 ? (
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {state.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
