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
}

const STATUS_COPY: Record<StatusRow["status"], string> = {
  pending: "Not approved yet. Admin usually reviews this within a few days.",
  approved: "Approved. This listing is on the public site.",
  rejected: "Not approved.",
}

export function SubmissionStatus({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("")
  const [rows, setRows] = useState<StatusRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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

  const body = (
    <div className="space-y-3">
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
      <p className="text-xs text-muted-foreground">
        For a secure view after you apply, use Sign in with the same email and a one-time code. There is no partner dashboard.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {rows && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions for that email.</p>
      ) : null}
      {rows && rows.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="rounded-md border border-border p-3">
              <p className="font-medium text-foreground">
                {row.name} · {row.city}
              </p>
              <p className="text-muted-foreground">
                {row.kind} · {row.status} · {STATUS_COPY[row.status]}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )

  if (compact) return body

  return (
    <Card>
      <CardContent className="p-4">{body}</CardContent>
    </Card>
  )
}