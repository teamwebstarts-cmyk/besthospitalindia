/** Client WhatsApp for every public query. Country code 91 + 8302610058. */
export const WHATSAPP_E164 = "918302610058"

export function whatsappHref(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_E164}`
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text)}`
}

/** Public-facing contact details for site chrome and contact pages. */
export const SITE_CONTACT = {
  mainEmail: "info@besthospitalindian.com",
  mainEmailHref: "mailto:info@besthospitalindian.com",
  supportEmail: "support@besthospitalindia.com",
  supportEmailHref: "mailto:support@besthospitalindia.com",
  partnershipsEmail: "partnerships@besthospitalindia.com",
  partnershipsEmailHref: "mailto:partnerships@besthospitalindia.com",
  phoneDisplay: "+91 83026 10058",
  phoneHref: "tel:+918302610058",
  whatsappDisplay: "+91 83026 10058",
  whatsappHref: whatsappHref(),
} as const

export const SITE_DISCLAIMER =
  "For discovery and coordination only—not medical advice. Verify all care details directly with providers before deciding."