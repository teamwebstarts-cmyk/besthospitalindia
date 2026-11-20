"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarIcon,
  InboxIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  StickyNoteIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Lead, LeadStatus } from "@/lib/leads/types"
import type { VendorPublic } from "@/lib/vendors/types"
import { cn } from "@/lib/utils"

const STATUSES: LeadStatus[] = ["new", "contacted", "closed"]

type StatusFilter = "all" | LeadStatus

function statusLabel(status: LeadStatus): string {
  if (status === "new") return "New"
  if (status === "contacted") return "Contacted"
  return "Closed"
}

function statusBadgeVariant(status: LeadStatus): "default" | "secondary" | "outline" {
  if (status === "new") return "default"
  if (status === "contacted") return "secondary"
  return "outline"
}

function trackLabel(lead: Lead): string {
  if (lead.track === "camp") return "Free medical camp"
  if (lead.track === "surgery") return "Free surgery"
  if (lead.track === "consultation") return "Free consultation"
  return "General enquiry"
}

function locationLabel(lead: Lead): string {
  if (lead.audience === "indian") return lead.state ?? "India"
  if (lead.embassy === "kenya") return "Embassy of Kenya"
  if (lead.embassy === "nepal") return "Embassy of Nepal"
  return "International"
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function VendorDesk({ vendor, initialLeads }: { vendor: VendorPublic; initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>("all")

  const cityLabel = vendor.city === "delhi" ? "Delhi" : "Indore"

  const counts = useMemo(() => {
    const base = { new: 0, contacted: 0, closed: 0, all: leads.length }
    for (const lead of leads) {
      base[lead.status] += 1
    }
    return base
  }, [leads])

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((lead) => lead.status === filter)),
    [filter, leads],
  )

  async function setStatus(id: string, status: LeadStatus) {
    setError(null)
    const response = await fetch(`/api/vendor/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
    if (!response.ok || !payload?.lead) {
      setError(payload?.error ?? "Could not update the query.")
      return
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? payload.lead! : lead)))
  }

  async function signOut() {
    await fetch("/api/vendor/session", { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="min-h-[100dvh] bg-linear-to-b from-muted/30 via-background to-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{vendor.name}</h1>
                <Badge variant="secondary" className="gap-1">
                  <MapPinIcon className="size-3" aria-hidden />
                  {cityLabel}
                </Badge>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                Patient enquiries routed to your desk only. Hospitals and doctors do not see this list.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2" onClick={signOut}>
              <LogOutIcon className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                { key: "all" as const, label: "Total", value: counts.all },
                { key: "new" as const, label: "New", value: counts.new },
                { key: "contacted" as const, label: "Contacted", value: counts.contacted },
                { key: "closed" as const, label: "Closed", value: counts.closed },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors",
                  filter === item.key
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-muted/50",
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-xl font-semibold tabular-nums text-foreground">{item.value}</p>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as StatusFilter)}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="new">New ({counts.new})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({counts.contacted})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <InboxIcon className="size-7" aria-hidden />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">No enquiries here yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {filter === "all"
                    ? `When patients choose ${cityLabel} on the public site, their queries will appear in this list.`
                    : `No ${filter} enquiries. Try another filter or check back after new submissions.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4">
            {visible.map((lead) => (
              <li key={lead.id}>
                <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3 sm:gap-4">
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary"
                          aria-hidden
                        >
                          {initials(lead.name)}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-foreground">{lead.name}</h2>
                            <Badge variant="outline" className="font-mono text-[11px]">
                              #{lead.id}
                            </Badge>
                            {lead.emailVerified ? (
                              <Badge variant="secondary">Email verified</Badge>
                            ) : (
                              <Badge variant="outline">Email pending</Badge>
                            )}
                            <Badge variant={statusBadgeVariant(lead.status)} className="sm:hidden">
                              {statusLabel(lead.status)}
                            </Badge>
                          </div>

                          <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <a
                              href={`mailto:${lead.email}`}
                              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <MailIcon className="size-4 shrink-0" aria-hidden />
                              <span className="truncate">{lead.email}</span>
                            </a>
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <PhoneIcon className="size-4 shrink-0" aria-hidden />
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-muted-foreground/70">
                                <PhoneIcon className="size-4 shrink-0" aria-hidden />
                                No phone
                              </span>
                            )}
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <MapPinIcon className="size-4 shrink-0" aria-hidden />
                              {locationLabel(lead)} · {trackLabel(lead)}
                            </span>
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="size-4 shrink-0" aria-hidden />
                              {formatWhen(lead.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-44">
                        <LabelledStatusSelect lead={lead} onStatus={setStatus} />
                        <Badge variant={statusBadgeVariant(lead.status)} className="hidden w-fit sm:inline-flex">
                          {statusLabel(lead.status)}
                        </Badge>
                      </div>
                    </div>

                    {(lead.comment || lead.detail) && (
                      <>
                        <Separator />
                        <div className="space-y-2 bg-muted/30 px-5 py-4">
                          {lead.comment ? (
                            <p className="flex gap-2 text-sm text-foreground">
                              <StickyNoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                              <span>
                                <span className="font-medium text-muted-foreground">Note: </span>
                                {lead.comment}
                              </span>
                            </p>
                          ) : null}
                          {lead.detail ? (
                            <p className="pl-6 text-sm text-muted-foreground">{lead.detail}</p>
                          ) : null}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function LabelledStatusSelect({
  lead,
  onStatus,
}: {
  lead: Lead
  onStatus: (id: string, status: LeadStatus) => void
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">Workflow status</span>
      <Select value={lead.status} onValueChange={(value) => onStatus(lead.id, value as LeadStatus)}>
        <SelectTrigger className="h-10 w-full" aria-label={`Status for ${lead.name}`}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}