"use client"

import { useState, type FormEvent } from "react"

import { AdminFormSheet } from "@/features/admin/components/admin-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LeadCity } from "@/lib/leads/types"
import type { VendorPublic } from "@/lib/vendors/types"

const fieldClass = "h-9 rounded-md border border-input bg-background px-2 text-sm"

export function AdminVendors({ initialVendors }: { initialVendors: VendorPublic[] }) {
  const [vendors, setVendors] = useState(initialVendors)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState<LeadCity>("delhi")

  async function create(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const response = await fetch("/api/vendors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, city }),
    })
    const payload = (await response.json().catch(() => null)) as { vendor?: VendorPublic; error?: string } | null
    if (!response.ok || !payload?.vendor) {
      setError(payload?.error ?? "Could not add the vendor.")
      return
    }
    setVendors((current) => [...current, payload.vendor!])
    setName("")
    setEmail("")
    setPassword("")
    setAddOpen(false)
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setError(null)
    const response = await fetch(`/api/vendors/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const payload = (await response.json().catch(() => null)) as { vendor?: VendorPublic; error?: string } | null
    if (!response.ok || !payload?.vendor) {
      setError(payload?.error ?? "Could not update the vendor.")
      return
    }
    setVendors((current) => current.map((vendor) => (vendor.id === id ? payload.vendor! : vendor)))
  }

  async function remove(id: string) {
    setError(null)
    const response = await fetch(`/api/vendors/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Could not delete the vendor.")
      return
    }
    setVendors((current) => current.filter((vendor) => vendor.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">City desks</h2>
        <AdminFormSheet
          title="Add vendor"
          triggerLabel="Add vendor"
          open={addOpen}
          onOpenChange={setAddOpen}
        >
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={create}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vendor-name">Name</Label>
              <Input id="vendor-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-password">Password</Label>
              <Input
                id="vendor-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vendor-city">City</Label>
              <select
                id="vendor-city"
                className={fieldClass}
                value={city}
                onChange={(event) => setCity(event.target.value as LeadCity)}
              >
                <option value="delhi">Delhi</option>
                <option value="indore">Indore</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save vendor</Button>
            </div>
          </form>
        </AdminFormSheet>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            <Card className="h-full border-border/70 shadow-none">
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-base font-semibold text-foreground">{vendor.name}</p>
                    <Badge variant={vendor.active ? "default" : "secondary"}>
                      {vendor.active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{vendor.email}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="capitalize">
                      {vendor.city}
                    </Badge>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => patch(vendor.id, { active: !vendor.active })}>
                    {vendor.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = window.prompt("New password (at least 6 characters)")
                      if (next) patch(vendor.id, { password: next })
                    }}
                  >
                    Set password
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(vendor.id)}>
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