"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StatusRow {
  id: string
  kind: "hospital" | "doctor"
  name: string
  city: string
  status: "pending" | "approved" | "rejected"
  emailVerified?: boolean
}

const STATUS_COPY: Record<StatusRow["status"], string> = {
  pending: "Not approved yet. Admin usually reviews this within a few days.",
  approved: "Approved. This listing is on the public site.",
  rejected: "Not approved.",
}

export function SubmissionStatus() {
  const [email, setEmail] = useState("")
  const [rows, setRows] = useState<StatusRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function saveRow(row: StatusRow) {
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: row.id, accountEmail: email, name: row.name, city: row.city }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string; submission?: StatusRow } | null
    if (!response.ok || !payload?.submission) {
      setError(payload?.error ?? "Could not save that change.")
      return
    }
    setRows((current) => current?.map((item) => item.id === row.id ? { ...item, name: payload.submission?.name ?? row.name, city: payload.submission?.city ?? row.city, status: payload.submission?.status ?? "pending" } : item) ?? null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const response = await fetch(`/api/catalogue/submissions?email=${encodeURIComponent(email)}`)
    const payload = (await response.json().catch(() => null)) as { submissions?: StatusRow[]; error?: string } | null
    setPending(false)
    if (!response.ok || !payload?.submissions) {
      setRows(null)
      setError(payload?.error ?? "Could not look up that email.")
      return
    }
    setRows(payload.submissions)
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSubmit}>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="submission-email">Check approval status</Label>
            <Input
              id="submission-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Official email used on the form"
              required
            />
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Checking…" : "Check status"}
          </Button>
        </form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {rows && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions for that email.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {rows.map((row) => (
              <li key={row.id} className="space-y-2 rounded-md border border-border p-3">
                <p className="text-muted-foreground">{row.kind} · {row.status} · {STATUS_COPY[row.status]}</p>
                {!row.emailVerified ? (
                  <form
                    className="flex flex-col gap-2 sm:flex-row sm:items-end"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      const input = event.currentTarget.elements.namedItem("otp")
                      const code = input instanceof HTMLInputElement ? input.value : ""
                      setError(null)
                      const response = await fetch("/api/catalogue/submissions", {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ id: row.id, accountEmail: email, otp: code }),
                      })
                      const payload = (await response.json().catch(() => null)) as { error?: string; submission?: StatusRow } | null
                      if (!response.ok || !payload?.submission) {
                        setError(payload?.error ?? "That code does not match.")
                        return
                      }
                      setRows((current) => current?.map((item) => item.id === row.id ? { ...item, emailVerified: true } : item) ?? null)
                    }}
                  >
                    <label className="flex-1 space-y-1">
                      <span className="font-medium">Email code</span>
                      <Input name="otp" inputMode="numeric" placeholder="6-digit code" />
                    </label>
                    <Button type="submit" variant="outline">Check code</Button>
                  </form>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="space-y-1">
                      <span className="font-medium">Name</span>
                      <Input
                        value={row.name}
                        aria-label={`Name for ${row.id}`}
                        onChange={(event) => setRows((current) => current?.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item) ?? null)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-medium">City</span>
                      <Input
                        value={row.city}
                        aria-label={`City for ${row.id}`}
                        onChange={(event) => setRows((current) => current?.map((item) => item.id === row.id ? { ...item, city: event.target.value } : item) ?? null)}
                      />
                    </label>
                    <Button type="button" variant="outline" onClick={() => saveRow(row)}>Save</Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {row.emailVerified ? "Email checked. " : "Enter the code from info@wispr.hospital to manage this application. It is not a patient query. "}
                  Saving a name or city change takes the listing off the public site until admin approves it again.
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
