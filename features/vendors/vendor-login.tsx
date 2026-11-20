"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { MapPinIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { PortalSignInShell } from "@/features/portal/sign-in-shell"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"

export function VendorLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { pending, slow, run } = useAsyncAction()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    await run(async () => {
      const response = await fetchResilient("/api/vendor/session", {
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
      icon={MapPinIcon}
      eyebrow="City desk"
      title="Your city’s patient enquiries"
      description="Sign in to see queries routed to your desk only—Delhi or Indore. Update status as you contact patients."
      highlights={[
        "Only enquiries for your assigned city",
        "Contact details and notes in one list",
        "Mark progress: new → contacted → closed",
      ]}
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="vendor-login-email">Desk email</Label>
          <Input
            id="vendor-login-email"
            type="email"
            autoComplete="username"
            placeholder="city@besthospitalindian.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-login-password">Password</Label>
          <Input
            id="vendor-login-password"
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
          Open city desk
        </PendingButton>
      </form>
    </PortalSignInShell>
  )
}