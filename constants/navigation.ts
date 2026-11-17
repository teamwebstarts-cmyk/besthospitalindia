import type { LucideIcon } from "lucide-react"
import {
  BellIcon,
  BookOpenCheckIcon,
  BuildingIcon,
  CalendarDaysIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  ClockIcon,
  FileTextIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  HeartIcon,
  HeartPulseIcon,
  HospitalIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  StethoscopeIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react"

/** A plain navigation link (label + href) used by the public chrome. */
export interface NavLink {
  label: string
  href: string
}

/** A navigation item for portal sidebars, with an optional leading icon. */
export interface PortalNavItem {
  label: string
  href: string
  icon?: LucideIcon
}

/** A labelled group of portal navigation items (e.g. admin sidebar sections). */
export interface PortalNavGroup {
  heading: string
  items: PortalNavItem[]
}

/** A sidebar entry: either a flat item or a labelled group of items. */
export type PortalNavEntry = PortalNavItem | PortalNavGroup

/** A grouped column of links for the public footer. */
export interface FooterNavGroup {
  heading: string
  links: NavLink[]
}

/**
 * Primary public navigation, rendered in PublicHeader.
 * Routes follow docs/implementation/02-page-inventory.md.
 */
export const publicNav: NavLink[] = [
  { label: "Hospitals", href: "/hospitals" },
  { label: "Doctors", href: "/doctors" },
  { label: "Facilities", href: "/facilities" },
  { label: "Medical Tourism", href: "/medical-tourism" },
  { label: "Treatments", href: "/treatments" },
  { label: "Free Consultation", href: "/free-consultation" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

/** Grouped footer link columns, rendered in PublicFooter. */
export const footerGroups: FooterNavGroup[] = [
  {
    heading: "Platform",
    links: [
      { label: "Hospitals", href: "/hospitals" },
      { label: "Doctors", href: "/doctors" },
      { label: "Facilities", href: "/facilities" },
      { label: "Treatments", href: "/treatments" },
      { label: "Medical Tourism", href: "/medical-tourism" },
      { label: "Free Consultation", href: "/free-consultation" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Rating Methodology", href: "/rating-methodology" },
      { label: "International Urban Forum", href: "/international-urban-forum" },
      { label: "For Hospitals", href: "/for-hospitals" },
      { label: "For Doctors", href: "/for-doctors" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Medical Disclaimer", href: "/disclaimer" },
    ],
  },
]

/** Patient portal sidebar navigation. */
export const patientNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboardIcon },
  { label: "Profile", href: "/patient/profile", icon: UserRoundIcon },
  { label: "Appointments", href: "/patient/appointments", icon: CalendarDaysIcon },
  { label: "Enquiries", href: "/patient/enquiries", icon: MessagesSquareIcon },
  { label: "Medical Reports", href: "/patient/reports", icon: FileTextIcon },
  { label: "Saved Providers", href: "/patient/saved", icon: HeartIcon },
  { label: "Reviews", href: "/patient/reviews", icon: StarIcon },
  { label: "Notifications", href: "/patient/notifications", icon: BellIcon },
  { label: "Settings", href: "/patient/settings", icon: SettingsIcon },
]

/** Hospital partner portal sidebar navigation. */
export const hospitalPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/hospital-portal", icon: LayoutDashboardIcon },
  { label: "Profile", href: "/hospital-portal/profile", icon: BuildingIcon },
  { label: "Specialities", href: "/hospital-portal/specialities", icon: HeartPulseIcon },
  { label: "Doctors", href: "/hospital-portal/doctors", icon: StethoscopeIcon },
  { label: "Appointments", href: "/hospital-portal/appointments", icon: CalendarDaysIcon },
  { label: "Enquiries", href: "/hospital-portal/enquiries", icon: MessagesSquareIcon },
  { label: "Reviews", href: "/hospital-portal/reviews", icon: StarIcon },
  { label: "Documents", href: "/hospital-portal/documents", icon: FileTextIcon },
  { label: "Ratings", href: "/hospital-portal/ratings", icon: ClipboardListIcon },
  { label: "Team", href: "/hospital-portal/team", icon: UsersIcon },
  { label: "Settings", href: "/hospital-portal/settings", icon: SettingsIcon },
]

/** Doctor partner portal sidebar navigation. */
export const doctorPortalNav: PortalNavItem[] = [
  { label: "Dashboard", href: "/doctor-portal", icon: LayoutDashboardIcon },
  { label: "Profile", href: "/doctor-portal/profile", icon: UserRoundIcon },
  { label: "Hospitals", href: "/doctor-portal/hospitals", icon: BuildingIcon },
  { label: "Availability", href: "/doctor-portal/availability", icon: ClockIcon },
  { label: "Appointments", href: "/doctor-portal/appointments", icon: CalendarDaysIcon },
  { label: "Consultations", href: "/doctor-portal/consultations", icon: MessagesSquareIcon },
  { label: "Credentials", href: "/doctor-portal/credentials", icon: ShieldCheckIcon },
  { label: "Reviews", href: "/doctor-portal/reviews", icon: StarIcon },
  { label: "Settings", href: "/doctor-portal/settings", icon: SettingsIcon },
]

/**
 * Admin sidebar navigation, grouped.
 * Items follow docs/implementation/14-admin-module-contracts.md — routes,
 * hrefs and labels are unchanged; items are only organized into sections.
 */
export const adminNavGroups: PortalNavGroup[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
    ],
  },
  {
    heading: "Provider Operations",
    items: [
      { label: "Hospitals", href: "/admin/hospitals", icon: BuildingIcon },
      { label: "Doctors", href: "/admin/doctors", icon: StethoscopeIcon },
      { label: "Facilities", href: "/admin/facilities", icon: HospitalIcon },
      { label: "Patients", href: "/admin/patients", icon: UsersIcon },
    ],
  },
  {
    heading: "Case & Trust Operations",
    items: [
      { label: "Appointments", href: "/admin/appointments", icon: CalendarDaysIcon },
      { label: "Consultations", href: "/admin/consultations", icon: MessagesSquareIcon },
      { label: "Medical Tourism", href: "/admin/medical-tourism", icon: GlobeIcon },
      { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
      { label: "Ratings", href: "/admin/ratings", icon: ClipboardListIcon },
      { label: "Rating Methodology", href: "/admin/rating-methodology", icon: BookOpenCheckIcon },
    ],
  },
  {
    heading: "Platform Operations",
    items: [
      { label: "Partners", href: "/admin/partners", icon: HeartHandshakeIcon },
      { label: "CMS", href: "/admin/cms", icon: NewspaperIcon },
      { label: "IUF", href: "/admin/iuf", icon: SparklesIcon },
      { label: "Notifications", href: "/admin/notifications", icon: BellIcon },
      { label: "Analytics", href: "/admin/analytics", icon: ChartColumnIcon },
      { label: "Roles", href: "/admin/roles", icon: KeyRoundIcon },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
]

/**
 * Flat admin navigation (all 18 items, unchanged order).
 * Kept for consumers that need a flat list; derived from adminNavGroups.
 */
export const adminNav: PortalNavItem[] = adminNavGroups.flatMap(
  (group) => group.items
)
