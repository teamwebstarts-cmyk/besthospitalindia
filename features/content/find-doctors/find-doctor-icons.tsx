/** Exact vector artwork from the Find Doctors home mock — scoped to .fd-* cards. */

export function FdStethBadgeIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 3v6a4 4 0 0 0 8 0V3" />
      <path d="M8 3H6M12 3h-2M10 13v2a5 5 0 0 0 10 0v-1" />
      <circle cx="20" cy="11" r="2" />
    </svg>
  )
}

export function FdHeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20.5s-8-5-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6-8 11-8 11z" />
    </svg>
  )
}

export function FdCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#12a150" />
      <path
        d="M7.5 12.5l3.2 3.2 5.8-6.4"
        fill="none"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FdClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" />
    </svg>
  )
}

export function FdPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path d="M12 21.5s-6.5-5.8-6.5-10.5a6.5 6.5 0 0 1 13 0c0 4.7-6.5 10.5-6.5 10.5z" />
      <circle cx="12" cy="11" r="2.3" />
    </svg>
  )
}

export function FdCapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4L2.5 9 12 14l9.5-5z" />
      <path d="M6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5" />
      <path d="M21.5 9v5" />
    </svg>
  )
}

export function FdBldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 21V8l6-4v17M10 21V11l6-2v12" />
      <path d="M16 21v-8h4v8M2 21h20" />
      <path d="M6.5 10h1M6.5 13h1M6.5 16h1M12.5 13h1M12.5 16h1" />
    </svg>
  )
}

export function FdCalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <rect x="7" y="13" width="6" height="5" rx="1" />
      <path d="M10 13v5M7 15.5h6" />
    </svg>
  )
}

export function FdPeopleIcon() {
  return (
    <svg
      viewBox="0 0 44 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="22" cy="8" r="4.2" />
      <path d="M14 24c0-4.8 3.5-8 8-8s8 3.2 8 8" />
      <circle cx="9" cy="10" r="3.2" />
      <path d="M2.5 23c0-3.8 2.5-6.2 6-6.2" />
      <circle cx="35" cy="10" r="3.2" />
      <path d="M41.5 23c0-3.8-2.5-6.2-6-6.2" />
    </svg>
  )
}

export function FdStethIcon() {
  return (
    <svg
      viewBox="0 0 32 34"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 3v10a6 6 0 0 0 12 0V3" />
      <path d="M5 3h4M15 3h4M13 19v3a7 7 0 0 0 14 0v-3" />
      <circle cx="27" cy="15.5" r="3" />
    </svg>
  )
}

export function FdStarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FFB800"
        stroke="#F59E0B"
        strokeWidth={1}
        strokeLinejoin="round"
        d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.4-6 3.4 1.3-6.7-5-4.6 6.8-.8z"
      />
    </svg>
  )
}

export function FdEyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={1.9}
      aria-hidden
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" fill="#fff" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="#0c7a60" stroke="none" />
    </svg>
  )
}

export function FdArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
