import type { Metadata } from "next"

import { ContactPageContent } from "@/features/content/contact-page"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact BestHospitalIndia for patient support, partnerships or general enquiries. Phone, email and message form.",
}

export default function ContactPage() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <ContactPageContent />
    </div>
  )
}