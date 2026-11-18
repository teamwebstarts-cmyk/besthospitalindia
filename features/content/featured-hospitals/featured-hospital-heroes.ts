import type { Hospital } from "@/types"

/** Original hero artwork provided for the home featured band (PNG). */
export const FEATURED_HOSPITAL_HERO_IMAGES: Record<string, string> = {
  "hosp-sunrise-delhi": "/images/hospitals/featured/sunrise-delhi-hero.png",
  "hosp-tranquilvalley-kochi": "/images/hospitals/featured/tranquilvalley-kochi-hero.png",
}

export function getFeaturedHospitalHeroImage(hospital: Hospital): string {
  return FEATURED_HOSPITAL_HERO_IMAGES[hospital.id] ?? hospital.image
}