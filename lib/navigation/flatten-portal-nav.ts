import type { PortalNavEntry, PortalNavItem } from "@/constants/navigation"

export function flattenPortalNav(entries: PortalNavEntry[]): PortalNavItem[] {
  return entries.flatMap((entry) => ("items" in entry ? entry.items : [entry]))
}