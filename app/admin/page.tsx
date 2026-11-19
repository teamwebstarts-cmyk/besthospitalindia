import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/features/admin"
import { hasAdminSession } from "@/lib/admin/session"
import { listLeads } from "@/lib/leads/store"
import { listVendors } from "@/lib/vendors/store"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Patient queries for admin and the Delhi and Indore desks.",
}

export const dynamic = "force-dynamic"

function trackLabel(track: string | null) {
  if (track === "camp") return "Free medical camp"
  if (track === "surgery") return "Free surgery"
  if (track === "consultation") return "Free consultation"
  return "Request not chosen"
}

export default async function AdminDashboardPage() {
  if (!(await hasAdminSession())) return null
  const [leads, vendors] = await Promise.all([listLeads(), listVendors()])
  const delhi = leads.filter((lead) => lead.preferredCity === "delhi").length
  const indore = leads.filter((lead) => lead.preferredCity === "indore").length
  const recent = leads.slice(0, 8)

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Dashboard" }]}
        title="Queries"
        description="Every query is stored here and with the city desk. Hospitals and doctors do not receive them."
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">All queries</p>
            <p className="text-2xl font-semibold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Delhi desk</p>
            <p className="text-2xl font-semibold">{delhi}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Indore desk</p>
            <p className="text-2xl font-semibold">{indore}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent queries</CardTitle>
            <Button variant="outline" size="sm" render={<Link href="/admin/leads" />}>View all</Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No queries yet.</p>
            ) : (
              <ul className="divide-y">
                {recent.map((lead) => (
                  <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{lead.name} · {lead.id}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {trackLabel(lead.track)} · {lead.vendorId ? (lead.preferredCity === "delhi" ? "Delhi" : "Indore") : "Admin only"} · {lead.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>City vendors</CardTitle>
            <Button variant="outline" size="sm" render={<Link href="/admin/vendors" />}>Manage</Button>
          </CardHeader>
          <CardContent>
            {leads.some((lead) => !lead.vendorId) ? (
              <p className="mb-3 text-sm text-muted-foreground">
                {leads.filter((lead) => !lead.vendorId).length} queries are with admin only because that city has no active desk.
              </p>
            ) : null}
            <ul className="space-y-3">
              {vendors.map((vendor) => {
                const count = leads.filter((lead) => lead.vendorId === vendor.id).length
                return (
                  <li key={vendor.id} className="text-sm">
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-muted-foreground">
                      {vendor.city} · {vendor.active ? "active" : "disabled"} · {count} {count === 1 ? "query" : "queries"}
                    </p>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
