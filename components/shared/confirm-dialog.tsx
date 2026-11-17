"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface ConfirmDialogProps {
  /** Label for the trigger button (defaults to "Delete"). */
  triggerLabel: string
  /** Heading inside the dialog. */
  title: string
  /** Supporting copy explaining the consequence. */
  description: string
  /** Label for the confirm button (defaults to "Confirm"). */
  confirmLabel?: string
  /** Label for the cancel button (defaults to "Cancel"). */
  cancelLabel?: string
  /** Called after the user confirms; the dialog closes automatically. */
  onConfirm: () => void
  /** Renders the confirm button with destructive styling. */
  destructive?: boolean
  /** Variant for the trigger button. */
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  /** Size for the trigger button. */
  triggerSize?: "default" | "xs" | "sm" | "lg"
  className?: string
}

/**
 * Confirmation dialog for destructive or hard-to-reverse mock actions.
 * Owns its open state; closes after confirm or cancel.
 */
export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  triggerVariant = "outline",
  triggerSize = "sm",
  className,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} size={triggerSize} className={className} />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
