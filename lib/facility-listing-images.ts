import type { FacilityCategory } from "@/types"
import { HOSPITAL_HERO_IMAGES_BY_ID } from "@/lib/hospital-hero-images"

/** Category-based hero photos for facility directory cards (demo fixtures). */
export const FACILITY_LISTING_IMAGE_BY_CATEGORY: Record<FacilityCategory, string> = {
  hospital: HOSPITAL_HERO_IMAGES_BY_ID["hosp-sunrise-delhi"],
  specialty_centre: HOSPITAL_HERO_IMAGES_BY_ID["hosp-silverlake-bengaluru"],
  diagnostic_lab: HOSPITAL_HERO_IMAGES_BY_ID["hosp-azurecoast-chennai"],
  rehabilitation: HOSPITAL_HERO_IMAGES_BY_ID["hosp-tranquilvalley-kochi"],
  wellness: HOSPITAL_HERO_IMAGES_BY_ID["hosp-goldenpeak-jaipur"],
  medical_tourism: HOSPITAL_HERO_IMAGES_BY_ID["hosp-metropulse-ahmedabad"],
}