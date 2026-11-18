import type { Hospital } from "@/types"
import { hospitalHeroImageForId, HOSPITAL_HERO_IMAGES_BY_ID } from "@/lib/hospital-hero-images"

/** @deprecated Prefer `HOSPITAL_HERO_IMAGES_BY_ID` from `@/lib/hospital-hero-images`. */
export const FEATURED_HOSPITAL_HERO_IMAGES = HOSPITAL_HERO_IMAGES_BY_ID

export function getFeaturedHospitalHeroImage(hospital: Hospital): string {
  return hospitalHeroImageForId(hospital.id) ?? hospital.image
}