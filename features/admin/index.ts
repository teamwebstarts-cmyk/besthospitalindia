/**
 * Admin Portal shared exports (A11).
 *
 * Local admin compositions only — nothing here duplicates a shared component;
 * they wrap or compose A00/A01 primitives.
 */

export { AdminPortalShell, type AdminPortalShellProps } from "./admin-portal-shell"
export { AdminPageHeader, type AdminPageHeaderProps } from "./components/admin-page-header"
export { DashboardKpi, type DashboardKpiProps } from "./components/dashboard-kpi"
export { AdminUserChip } from "./components/admin-user-chip"
export { formatDate, formatDateTime } from "./format"
export * from "./selectors"
