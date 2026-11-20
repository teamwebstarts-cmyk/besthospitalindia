/**
 * AdminUserChip — topbar identity chip for the Admin Portal (A11).
 *
 * Mirrors the A09/A10 portal identity chips: a demo-only marker showing the
 * mock super-admin role. No real auth exists and none is implied
 * (10-routing-and-layouts.md: portal guards are mock-only and labelled).
 */

export function AdminUserChip() {
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      >
        SA
      </span>
      <span className="hidden xl:inline">Super Admin</span>
      <span className="sr-only">Signed in as platform super admin.</span>
    </span>
  )
}
