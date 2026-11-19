"use client"

import { useEffect, useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DoctorProfileAppointmentAsideProps {
  providerName: string
  children: ReactNode
  className?: string
}

/** Mobile: collapsed booking card until the user opts in; desktop: always shows the form. */
export function DoctorProfileAppointmentAside({
  providerName,
  children,
  className,
}: DoctorProfileAppointmentAsideProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#appointment") {
        setOpen(true)
        requestAnimationFrame(() => {
          document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
      }
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [])

  return (
    <aside
      id="appointment"
      className={cn(
        "scroll-mt-[calc(var(--site-header-offset,3.5rem)+3.5rem)] space-y-2",
        className,
      )}
    >
      <div className="lg:hidden">
        {open ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Close form
            </Button>
            {children}
          </div>
        ) : (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-sm font-medium text-foreground">Book with {providerName}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Send a request in a few steps. Not confirmed until the doctor accepts.
              </p>
              <Button
                type="button"
                variant="cta"
                className="h-10 w-full rounded-full font-semibold"
                onClick={() => setOpen(true)}
              >
                Open appointment form
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="hidden lg:block">{children}</div>
    </aside>
  )
}