import type { Metadata } from "next"

import { AuthEntryCard } from "@/features/content/auth-entry-card"
import { DemoNotice } from "@/features/content/demo-notice"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or register on BestHospitalIndia: patient email/mobile OTP entry, hospital and doctor partner registration routes. Demo authentication only.",
}

/**
 * /auth — Authentication entry (19-auth). Rendered inside the (auth) segment:
 * minimal header, centered narrow card, mock-only notice. No clinical content.
 */
export default function AuthPage() {
  return (
    <div className="py-8">
      <DemoNotice
        title="Demo authentication — no real accounts"
        message="Sign-in and registration on this page are simulated for the demo build. No email or SMS is sent, no account is created, and the demo session exists only in this browser tab."
      />
      <div className="mt-6">
        <AuthEntryCard />
      </div>
    </div>
  )
}
