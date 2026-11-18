import type { LucideIcon } from "lucide-react"
import { BuildingIcon, CalendarDaysIcon, HeartPulseIcon, HospitalIcon, LayoutDashboardIcon, StethoscopeIcon, UserRoundIcon, ClockIcon } from "lucide-react"

export interface NavLink { label: string; href: string }
export interface PortalNavItem { label: string; href: string; icon?: LucideIcon }
export interface PortalNavGroup { heading: string; items: PortalNavItem[] }
export type PortalNavEntry = PortalNavItem | PortalNavGroup
export interface FooterNavGroup { heading: string; links: NavLink[] }

export const publicNav: NavLink[] = [
  { label: "Home", href: "/" }, { label: "Hospitals", href: "/hospitals" },
  { label: "Doctors", href: "/doctors" }, { label: "Facilities", href: "/facilities" },
  { label: "Free Consultation", href: "/free-consultation" }, { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export const footerGroups: FooterNavGroup[] = [
  { heading: "Platform", links: [
    { label: "Hospitals", href: "/hospitals" }, { label: "Doctors", href: "/doctors" },
    { label: "Facilities", href: "/facilities" }, { label: "Treatments", href: "/treatments" },
    { label: "Medical Tourism", href: "/medical-tourism" }, { label: "Free Consultation", href: "/free-consultation" },
  ]},
  { heading: "Company", links: [
    { label: "About", href: "/about" }, { label: "How It Works", href: "/how-it-works" },
    { label: "Rating Methodology", href: "/rating-methodology" }, { label: "International Urban Forum", href: "/international-urban-forum" },
    { label: "For Hospitals", href: "/for-hospitals" }, { label: "For Doctors", href: "/for-doctors" }, { label: "Contact", href: "/contact" },
  ]},
  { heading: "Legal", links: [
    { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Use", href: "/terms" }, { label: "Medical Disclaimer", href: "/disclaimer" },
  ]},
]

/** Patient accounts are intentionally outside the MVP; patients book from public provider pages. */
export const patientNav: PortalNavItem[] = []

export const hospitalPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/hospital-portal", icon: LayoutDashboardIcon },
  { label: "Hospital Profile", href: "/hospital-portal/profile", icon: BuildingIcon },
  { label: "Specialties", href: "/hospital-portal/specialities", icon: HeartPulseIcon },
  { label: "Doctors", href: "/hospital-portal/doctors", icon: StethoscopeIcon },
  { label: "Appointments", href: "/hospital-portal/appointments", icon: CalendarDaysIcon },
]

export const doctorPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/doctor-portal", icon: LayoutDashboardIcon },
  { label: "My Profile", href: "/doctor-portal/profile", icon: UserRoundIcon },
  { label: "Hospitals", href: "/doctor-portal/hospitals", icon: BuildingIcon },
  { label: "Availability", href: "/doctor-portal/availability", icon: ClockIcon },
  { label: "Appointments", href: "/doctor-portal/appointments", icon: CalendarDaysIcon },
]

export const adminNavGroups: PortalNavGroup[] = [
  { heading: "MVP Management", items: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
    { label: "Hospitals", href: "/admin/hospitals", icon: BuildingIcon },
    { label: "Doctors", href: "/admin/doctors", icon: StethoscopeIcon },
    { label: "Facilities", href: "/admin/facilities", icon: HospitalIcon },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarDaysIcon },
  ]},
]
export const adminNav: PortalNavItem[] = adminNavGroups.flatMap((group) => group.items)
