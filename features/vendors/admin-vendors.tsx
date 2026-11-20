"use client"

import { useRef, useState, type FormEvent } from "react"
import { MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { AdminFormSheet } from "@/features/admin/components/admin-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PendingButton } from "@/features/portal/pending-button"
import type { LeadCity } from "@/lib/leads/types"
import type { VendorPublic } from "@/lib/vendors/types"

const fieldClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm"

export function AdminVendors({ initialVendors }: { initialVendors: VendorPublic[] }) {
  const [vendors, setVendors] = useState(initialVendors)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editVendor, setEditVendor] = useState<VendorPublic | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState<LeadCity>("delhi")
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const createGuard = useRef(false)

  function mergeVendorRow(next: VendorPublic) {
    setVendors((current) => {
      const index = current.findIndex((row) => row.id === next.id)
      if (index >= 0) {
        const copy = [...current]
        copy[index] = next
        return copy
      }
      return [...current, next]
    })
  }

  async function create(event: FormEvent) {
    event.preventDefault()
    if (creating || createGuard.current) return
    createGuard.current = true
    setCreating(true)
    setError(null)
    try {
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
      mergeVendorRow(payload.vendor)
      setName("")
      setEmail("")
      setPassword("")
      setCity("delhi")
      setAddOpen(false)
    } finally {
      setCreating(false)
      createGuard.current = false
    }
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
      return null
    }
    mergeVendorRow(payload.vendor)
    return payload.vendor
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this city desk? Leads already routed stay in the database.")) return
    setError(null)
    const response = await fetch(`/api/vendors/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Could not delete the vendor.")
      return
    }
    setVendors((current) => current.filter((vendor) => vendor.id !== id))
  }

  function openEdit(vendor: VendorPublic) {
    setEditVendor(vendor)
    setEditName(vendor.name)
    setEditEmail(vendor.email)
    setEditPassword("")
    setError(null)
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault()
    if (!editVendor || savingEdit) return
    const passwordTrim = editPassword.trim()
    if (passwordTrim.length > 0 && passwordTrim.length < 6) {
      setError("Password must be at least 6 characters, or leave blank to keep the current one.")
      return
    }
    setSavingEdit(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { name: editName, email: editEmail }
      if (passwordTrim.length >= 6) body.password = passwordTrim
      const updated = await patch(editVendor.id, body)
      if (updated) {
        setEditVendor(null)
        setEditPassword("")
      }
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          One active desk per city receives new patient queries. Each login email can only be used once.
        </p>
        <AdminFormSheet title="Add city desk" triggerLabel="Add vendor" open={addOpen} onOpenChange={setAddOpen}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={create}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vendor-name">Desk name</Label>
              <Input id="vendor-name" value={name} onChange={(event) => setName(event.target.value)} required disabled={creating} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-email">Login email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={creating}
                autoComplete="off"
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
                disabled={creating}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vendor-city">City</Label>
              <select
                id="vendor-city"
                className={fieldClass}
                value={city}
                onChange={(event) => setCity(event.target.value as LeadCity)}
                disabled={creating}
              >
                <option value="delhi">Delhi</option>
                <option value="indore">Indore</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <PendingButton type="submit" pending={creating} pendingLabel="Saving…" className="w-full sm:w-auto">
                Save vendor
              </PendingButton>
            </div>
          </form>
        </AdminFormSheet>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            <Card className="h-full overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{vendor.name}</h3>
                    <Badge variant={vendor.active ? "default" : "secondary"}>{vendor.active ? "Active" : "Disabled"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{vendor.email}</p>
                  <Badge variant="outline" className="gap-1 capitalize">
                    <MapPinIcon className="size-3" aria-hidden />
                    {vendor.city}
                  </Badge>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button type="button" variant="default" size="sm" className="gap-1" onClick={() => openEdit(vendor)}>
                    <PencilIcon className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => patch(vendor.id, { active: !vendor.active })}>
                    {vendor.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => remove(vendor.id)}
                  >
                    <Trash2Icon className="size-3.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {editVendor ? (
        <AdminFormSheet
          title={`Edit ${editVendor.name}`}
          description="Login email and password apply immediately for vendor sign-in."
          hideTrigger
          open={editVendor !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditVendor(null)
              setEditPassword("")
            }
          }}
        >
          <form className="space-y-4" onSubmit={saveEdit}>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-name">Desk name</Label>
              <Input id="edit-vendor-name" value={editName} onChange={(e) => setEditName(e.target.value)} required disabled={savingEdit} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-email">Login email</Label>
              <Input
                id="edit-vendor-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                disabled={savingEdit}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Vendors sign in with this email after you save.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-password">New password</Label>
              <Input
                id="edit-vendor-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                minLength={6}
                disabled={savingEdit}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
              />
            </div>
            <PendingButton type="submit" pending={savingEdit} pendingLabel="Saving…">
              Save changes
            </PendingButton>
          </form>
        </AdminFormSheet>
      ) : null}
    </div>
  )
}