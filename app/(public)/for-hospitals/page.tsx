import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "For Hospitals",
  description: "Hospital partners apply from the partner sign-in page.",
}

export default function ForHospitalsPage() {
  redirect("/auth")
}