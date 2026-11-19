const FOOTER_DISCLAIMER_HIDDEN_PREFIXES = [
  "/hospitals",
  "/doctors",
  "/facilities",
] as const

/** Legal disclaimer is omitted on hospital, doctor, and facility routes only. */
export function shouldShowFooterDisclaimer(pathname: string): boolean {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "/"
  return !FOOTER_DISCLAIMER_HIDDEN_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}