import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AsyncWaitBannerProps {
  /** Show the banner (typically while a request is in flight). */
  visible: boolean
  /** After a few seconds, switch to the cold-start copy. */
  slow?: boolean
  className?: string
}

export function AsyncWaitBanner({ visible, slow = false, className }: AsyncWaitBannerProps) {
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-3 text-sm text-foreground",
        className,
      )}
    >
      <Loader2Icon className="mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden />
      <div className="space-y-0.5">
        <p className="font-medium">{slow ? "Waking up the server…" : "Please wait…"}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {slow
            ? "Free hosting can take up to a minute after idle time. Your request is still running—do not refresh the page."
            : "We are securely processing your request."}
        </p>
      </div>
    </div>
  )
}