import type { Metadata } from "next"

import { AboutPageContent } from "@/features/content/about-page"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "BestHospitalIndia is a healthcare discovery platform for hospitals, doctors and facilities across India — built on structured discovery, independent ratings and visible verification states.",
}

export default function AboutPage() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <AboutPageContent />
    </div>
  )
}