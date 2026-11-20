"use client"

import { useMemo, useState } from "react"
import { CalendarIcon, MailIcon, PhoneIcon, Trash2Icon } from "lucide-react"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminEqualHeightCardBodyClass,
  adminEqualHeightCardClass,
  adminEqualHeightGridClass,
  adminEqualHeightListItemClass,
} from "@/features/admin/admin-card-grid"
import type { Lead, LeadStatus } from "@/lib/leads/types"
import { cn } from "@/lib/utils"

const STATUSES: LeadStatus[] = ["new", "contacted", "closed"]

type StatusFilter = "all" | LeadStatus

function statusLabel(status: LeadStatus): string {
  if (status === "new") return "New"
  if (status === "contacted") return "Contacted"
  return "Closed"
}

function trackLabel(lead: Lead): string {
  if (lead.track === "camp") return "Medical camp"
  if (lead.track === "surgery") return "Surgery"
  if (lead.track === "consultation") return "Consultation"
  return "Not chosen"
}

function deskLabel(lead: Lead): string {
  if (!lead.vendorId) return "No desk"
  return lead.preferredCity === "delhi" ? "Delhi desk" : "Indore desk"
}

function regionLabel(lead: Lead): string {
  return lead.audience === "indian" ? (lead.state ?? "—") : `Embassy · ${lead.embassy ?? "—"}`
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function AdminLeads({
  initialLeads,
  emailCodes,
}: {
  initialLeads: Lead[]
  emailCodes: Record<string, string>
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>("all")

  const counts = useMemo(() => {
    const base = { new: 0, contacted: 0, closed: 0, all: leads.length }
    for (const lead of leads) base[lead.status] += 1
    return base
  }, [leads])

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((lead) => lead.status === filter)),
    [filter, leads],
  )

  async function setStatus(id: string, status: LeadStatus) {
    setError(null)
    const response = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
    if (!response.ok || !payload?.lead) {
      setError(payload?.error ?? "Could not update the lead.")
      return
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? payload.lead! : lead)))
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this query permanently?")) return
    setError(null)
    const response = await fetch(`/api/leads/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Could not delete the lead.")
      return
    }
    setLeads((current) => current.filter((lead) => lead.id !== id))
  }

  if (leads.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">No patient queries yet.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

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
            <p className="text-xl font-semibold tabular-nums">{item.value}</p>
          </button>
        ))}
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as StatusFilter)}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="new">New ({counts.new})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({counts.contacted})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <ul className={adminEqualHeightGridClass}>
        {visible.map((lead) => (
          <li key={lead.id} className={adminEqualHeightListItemClass}>
            <Card className={adminEqualHeightCardClass}>
              <CardContent className={adminEqualHeightCardBodyClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base font-semibold text-foreground">{lead.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground">#{lead.id}</p>
                  </div>
                  <div className="w-full shrink-0 space-y-1 sm:w-36">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Select value={lead.status} onValueChange={(value) => setStatus(lead.id, value as LeadStatus)}>
                      <SelectTrigger className="h-9 w-full" aria-label={`Status for ${lead.name}`}>
                        <SelectValue />
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
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{trackLabel(lead)}</Badge>
                  <Badge variant="outline">{deskLabel(lead)}</Badge>
                  <Badge variant="outline">{regionLabel(lead)}</Badge>
                  <Badge variant={lead.emailVerified ? "default" : "secondary"}>
                    {lead.emailVerified ? "Email verified" : "Email pending"}
                  </Badge>
                </div>

                <div className="grid gap-2 text-sm">
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex min-w-0 items-start gap-2 break-all text-muted-foreground hover:text-foreground"
                  >
                    <MailIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span className="min-w-0">{lead.email}</span>
                  </a>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <PhoneIcon className="size-4 shrink-0" aria-hidden />
                      {lead.phone}
                    </a>
                  ) : null}
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="size-4 shrink-0" aria-hidden />
                    {formatWhen(lead.createdAt)}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-start gap-2">
                  {lead.comment || lead.detail ? (
                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      {lead.comment ? <p className="wrap-break-word">{lead.comment}</p> : null}
                      {lead.detail ? <p className="mt-1 wrap-break-word text-muted-foreground">{lead.detail}</p> : null}
                    </div>
                  ) : null}
                </div>

                {emailCodes[lead.id] ? (
                  <p className="text-xs text-muted-foreground">
                    Latest email code: <span className="font-mono font-medium text-foreground">{emailCodes[lead.id]}</span>
                  </p>
                ) : null}

                <div className="mt-auto flex justify-end border-t border-border/60 pt-3">
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => remove(lead.id)}>
                    <Trash2Icon className="size-3.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}