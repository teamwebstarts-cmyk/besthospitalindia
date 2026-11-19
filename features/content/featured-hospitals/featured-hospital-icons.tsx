export function FhHospitalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `fh-hospital-glyph ${className}` : "fh-hospital-glyph"}
      aria-hidden
    >
      <path d="M14 41V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v32" />
      <path d="M14 24H8a2 2 0 0 0-2 2v15M34 24h6a2 2 0 0 1 2 2v15M4 41h40" />
      <path d="M24 11v8M20 15h8" />
      <path d="M19.5 27h1M27.5 27h1M19.5 33h1M27.5 33h1M10 32h1M37 32h1" />
      <path d="M21 41v-5h6v5" />
    </svg>
  )
}

export function FhCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#14a07b" />
      <path
        d="M6.8 12.4l3.6 3.6 6.8-7.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FhHeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-8-5-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6-8 11-8 11z" />
    </svg>
  )
}

export function FhPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[17px] shrink-0" aria-hidden>
      <path
        d="M12 21.5s-6.5-5.8-6.5-10.5a6.5 6.5 0 0 1 13 0c0 4.7-6.5 10.5-6.5 10.5z"
        fill="none"
        stroke="#3d4a54"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="11" r="2.3" fill="#3d4a54" />
    </svg>
  )
}

export function FhPeopleIcon() {
  return (
    <svg viewBox="0 0 48 32" fill="currentColor" className="h-8 w-12 text-[#2aa98a]" aria-hidden>
      <circle cx="24" cy="9" r="6.2" />
      <path d="M12.5 29c0-6.5 5-10.8 11.5-10.8S35.5 22.5 35.5 29z" />
      <circle cx="9.5" cy="13" r="4.8" />
      <path d="M0 28.5c0-5 3.2-8.3 8-8.3 1.7 0 3 .4 4.2 1.1-2.2 2-3.5 4.4-3.7 7.2z" />
      <circle cx="38.5" cy="13" r="4.8" />
      <path d="M48 28.5c0-5-3.2-8.3-8-8.3-1.7 0-3 .4-4.2 1.1 2.2 2 3.5 4.4 3.7 7.2z" />
    </svg>
  )
}

export function FhStethoscopeIcon() {
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-11 w-10 text-[#2aa98a]"
      aria-hidden
    >
      <path d="M6 4h5M21 4h5M8.5 4v13a7.5 7.5 0 0 0 15 0V4" />
      <path d="M16 25v7a9 9 0 0 0 18 0v-5" />
      <circle cx="34" cy="23" r="4" />
    </svg>
  )
}

export function FhStarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[25px]" aria-hidden>
      <defs>
        <linearGradient id="fhStarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc83d" />
          <stop offset="1" stopColor="#f2a516" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fhStarGrad)"
        stroke="#f2a516"
        strokeWidth="1"
        strokeLinejoin="round"
        d="M12 2.3 14.9 8.6l6.9.8-5.1 4.7 1.4 6.8-6.1-3.5-6.1 3.5 1.4-6.8L2.2 9.4l6.9-.8z"
      />
    </svg>
  )
}

export function FhCalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden
    >
      <rect x="3" y="4.5" width="18" height="16.5" rx="3.5" />
      <path d="M3 10h18M8 2.5v4M16 2.5v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth="2.6" />
    </svg>
  )
}

export function FhWhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden
    >
      <path d="M3 21l1.7-4.9A9 9 0 1 1 8 19.4z" />
      <path
        d="M9.2 7.8c-.6.6-.9 1.5-.5 2.6.9 2.3 2.8 4.1 5.1 5 1.1.4 2-.1 2.5-.8l.2-.6-2-1.1-.9.8c-1.2-.5-2.1-1.4-2.7-2.6l.7-.9-.9-2z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}