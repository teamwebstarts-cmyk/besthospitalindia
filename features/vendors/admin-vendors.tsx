"use client"

import { useState, type FormEvent } from "react"

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
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={create}>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-name">Name</Label>
              <Input id="vendor-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-email">Email</Label>
              <Input id="vendor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-password">Password</Label>
              <Input id="vendor-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-city">City</Label>
              <select id="vendor-city" className={fieldClass} value={city} onChange={(event) => setCity(event.target.value as LeadCity)}>
                <option value="delhi">Delhi</option>
                <option value="indore">Indore</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add vendor</Button>
            </div>
          </form>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <p className="mt-3 text-xs text-muted-foreground">
            Adding or enabling a desk turns off the other active desk for that same city. New queries go to the active desk only. Seed logins: delhi@besthospitalindian.com / delhi-demo, and indore@besthospitalindian.com / indore-demo.
          </p>
        </CardContent>
      </Card>

      <ul className="space-y-3">
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{vendor.name}</p>
                  <p className="text-muted-foreground">{vendor.email} · {vendor.city} · {vendor.active ? "active" : "disabled"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
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
