/**
 * Curated state tiles for the home "Top medical destinations" band.
 * Images are landmark / landscape photos stored under /public (not AI placeholders).
 */

export interface MedicalDestinationStateCard {
  state: string
  imageSrc: string
  /** Short supporting line under the state name. */
  tagline: string
}

export const homeMedicalDestinationStates: readonly MedicalDestinationStateCard[] = [
  {
    state: "Delhi",
    imageSrc: "/images/destinations/states/delhi.jpg",
    tagline: "Capital region care networks",
  },
  {
    state: "Maharashtra",
    imageSrc: "/images/destinations/states/maharashtra.jpg",
    tagline: "Metro hospitals & specialists",
  },
  {
    state: "Karnataka",
    imageSrc: "/images/destinations/states/karnataka.jpg",
    tagline: "Bengaluru medical hub",
  },
  {
    state: "Tamil Nadu",
    imageSrc: "/images/destinations/states/tamil-nadu.jpg",
    tagline: "Chennai & coastal centres",
  },
  {
    state: "Kerala",
    imageSrc: "/images/destinations/states/kerala.jpg",
    tagline: "Wellness & recovery",
  },
  {
    state: "Rajasthan",
    imageSrc: "/images/destinations/states/rajasthan.jpg",
    tagline: "Heritage-city hospitals",
  },
  {
    state: "Gujarat",
    imageSrc: "/images/destinations/states/gujarat.jpg",
    tagline: "Ahmedabad & western India",
  },
  {
    state: "Uttar Pradesh",
    imageSrc: "/images/destinations/states/uttar-pradesh.jpg",
    tagline: "North India access",
  },
] as const