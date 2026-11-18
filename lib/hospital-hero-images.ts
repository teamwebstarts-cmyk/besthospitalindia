/** Per-fixture hospital hero paths — single source for home + directory cards. */
const CARD = "/images/hospitals/featured/cards"

export const HOSPITAL_HERO_IMAGES_BY_ID: Record<string, string> = {
  "hosp-sunrise-delhi": `${CARD}/sunrise-delhi.jpg`,
  "hosp-sunrise-mumbai": `${CARD}/sunrise-mumbai.jpg`,
  "hosp-silverlake-bengaluru": `${CARD}/silverlake-bengaluru.jpg`,
  "hosp-goldenpeak-jaipur": `${CARD}/goldenpeak-jaipur.jpg`,
  "hosp-metropulse-ahmedabad": `${CARD}/metropulse-ahmedabad.jpg`,
  "hosp-tranquilvalley-kochi": `${CARD}/tranquilvalley-kochi.jpg`,
  "hosp-azurecoast-chennai": `${CARD}/azurecoast-chennai.jpg`,
  "hosp-northganga-varanasi": `${CARD}/northganga-varanasi.jpg`,
}

export function hospitalHeroImageForId(id: string): string | undefined {
  return HOSPITAL_HERO_IMAGES_BY_ID[id]
}