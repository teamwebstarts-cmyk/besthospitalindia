import type { LucideIcon } from "lucide-react"
import {
  Building2Icon,
  BuildingIcon,
  CalendarDaysIcon,
  HomeIcon,
  HospitalIcon,
  LayoutDashboardIcon,
  StethoscopeIcon,
  UserRoundIcon,
} from "lucide-react"

export interface NavLink { label: string; href: string }

/** Mobile bottom tab bar — discovery shortcuts (public layout only). */
export interface PublicMobileTab {
  label: string
  href: string
  icon: LucideIcon
}

export const publicMobileTabs: PublicMobileTab[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Hospitals", href: "/hospitals", icon: HospitalIcon },
  { label: "Doctors", href: "/doctors", icon: StethoscopeIcon },
  { label: "Facilities", href: "/facilities", icon: Building2Icon },
  { label: "Consult", href: "/free-consultation", icon: CalendarDaysIcon },
]
export interface PortalNavItem { label: string; href: string; icon?: LucideIcon }
export interface PortalNavGroup { heading: string; items: PortalNavItem[] }
export type PortalNavEntry = PortalNavItem | PortalNavGroup
export interface FooterNavGroup { heading: string; links: NavLink[] }

/** Desktop mega-nav (matches marketing header mock — consultation CTA lives in top bar). */
export const publicNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Hospitals", href: "/hospitals" },
  { label: "Doctors", href: "/doctors" },
  { label: "Facilities", href: "/facilities" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export const footerGroups: FooterNavGroup[] = [
  { heading: "Platform", links: [
    { label: "Hospitals", href: "/hospitals" },
    { label: "Doctors", href: "/doctors" },
    { label: "Facilities", href: "/facilities" },
    { label: "Free Consultation", href: "/free-consultation" },
  ]},
  { heading: "Company", links: [
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "For Hospitals", href: "/for-hospitals" },
    { label: "For Doctors", href: "/for-doctors" },
    { label: "Contact", href: "/contact" },
  ]},
  { heading: "Legal", links: [
    { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Use", href: "/terms" }, { label: "Medical Disclaimer", href: "/disclaimer" },
  ]},
]

/** Patient accounts are intentionally outside the MVP; patients book from public provider pages. */
export const patientNav: PortalNavItem[] = []

export const hospitalPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/hospital-portal", icon: LayoutDashboardIcon },
]

export const doctorPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/doctor-portal", icon: LayoutDashboardIcon },
]

export const adminNavGroups: PortalNavGroup[] = [
  { heading: "MVP Management", items: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
    { label: "Leads", href: "/admin/leads", icon: CalendarDaysIcon },
    { label: "Vendors", href: "/admin/vendors", icon: UserRoundIcon },
    { label: "Hospitals", href: "/admin/hospitals", icon: BuildingIcon },
    { label: "Doctors", href: "/admin/doctors", icon: StethoscopeIcon },
    { label: "Facilities", href: "/admin/facilities", icon: HospitalIcon },
  ]},
]
export const adminNav: PortalNavItem[] = adminNavGroups.flatMap((group) => group.items)
