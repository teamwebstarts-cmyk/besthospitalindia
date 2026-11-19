import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"

export default function AppointmentRequestPage() {
  redirect(ROUTES.public.freeConsultation)
}
