"use client"

import type { ReactNode } from "react"
import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface AdminFormSheetProps {
  title: string
  description?: string
  triggerLabel?: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When set, renders a controlled sheet without the default plus trigger. */
  hideTrigger?: boolean
  className?: string
}

export function AdminFormSheet({
  title,
  description,
  triggerLabel = "Add",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
  className,
}: AdminFormSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger ? (
        <SheetTrigger
          render={
            <Button type="button" size="sm" className="gap-1.5">
              <PlusIcon aria-hidden className="size-4" />
              {triggerLabel}
            </Button>
          }
        />
      ) : null}
      <SheetContent side="right" className={className ?? "flex w-full flex-col gap-0 p-0 sm:max-w-xl"}>
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}