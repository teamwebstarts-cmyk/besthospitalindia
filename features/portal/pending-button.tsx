import type { ComponentProps } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PendingButton({
  pending,
  pendingLabel,
  children,
  className,
  disabled,
  ...props
}: ComponentProps<typeof Button> & {
  pending?: boolean
  pendingLabel?: string
}) {
  return (
    <Button
      {...props}
      className={cn(pending && "gap-2", className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}