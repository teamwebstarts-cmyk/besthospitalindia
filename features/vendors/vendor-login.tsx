"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function VendorLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const response = await fetch("/api/vendor/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    setPending(false)
    if (!response.ok) {
      setError(payload?.error ?? "Could not sign in.")
      return
    }
    router.refresh()
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardContent className="space-y-4 p-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">City desk</h1>
            <p className="text-sm text-muted-foreground">Sign in to see queries for your city only.</p>
          </div>
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-login-email">Email</Label>
              <Input id="vendor-login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-login-password">Password</Label>
              <Input id="vendor-login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
