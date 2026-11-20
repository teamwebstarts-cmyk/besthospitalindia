"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LockKeyholeIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { PortalSignInShell } from "@/features/portal/sign-in-shell"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { pending, slow, run } = useAsyncAction()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    await run(async () => {
      const response = await fetchResilient("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(payload?.error ?? "Could not sign in.")
        return
      }
      router.refresh()
    }).catch(() => {
      setError("The server took too long to respond. Wait a moment and try again.")
    })
  }

  return (
    <PortalSignInShell
      icon={LockKeyholeIcon}
      eyebrow="Admin portal"
      title="Sign in to manage the platform"
      description="Review patient enquiries, approve hospital and doctor listings, and coordinate city desks from one place."
      highlights={[
        "Full visibility across Delhi and Indore queries",
        "Catalogue approval for partners and facilities",
        "Vendor desk oversight and lead routing",
      ]}
      footer={
        <p className="text-xs leading-relaxed text-muted-foreground">
          Test sign-in: <span className="font-medium text-foreground">admin@besthospitalindian.com</span>
          {" · "}
          password <span className="font-medium text-foreground">admin-demo</span>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Work email</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-11"
          />
        </div>
        <AsyncWaitBanner visible={pending} slow={slow} />
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <PendingButton type="submit" pending={pending} pendingLabel="Signing in…" className="h-11 w-full text-base">
          Continue to dashboard
        </PendingButton>
      </form>
    </PortalSignInShell>
  )
}