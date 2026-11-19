import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "For Doctors",
  description: "Doctor partners apply from the partner sign-in page.",
}

export default function ForDoctorsPage() {
  redirect("/auth?role=doctor")
}