import type { Metadata } from "next"

import { AuthEntryCard } from "@/features/content/auth-entry-card"

export const metadata: Metadata = {
  title: "Partner sign in",
  description: "Hospital and doctor partners apply from this page. Patients book on the public site.",
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  return (
    <div className="py-4 sm:py-8">
      <AuthEntryCard defaultRole={role === "doctor" ? "doctor" : "hospital"} />
    </div>
  )
}