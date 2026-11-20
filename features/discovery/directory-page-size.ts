/** Default cards per directory page (hospitals, doctors, facilities). */
export const DIRECTORY_DEFAULT_PAGE_SIZE = 9

export const DIRECTORY_PAGE_SIZE_OPTIONS = [9, 10, 20] as const

export type DirectoryPageSize = (typeof DIRECTORY_PAGE_SIZE_OPTIONS)[number]

export function isDirectoryPageSize(value: number): value is DirectoryPageSize {
  return (DIRECTORY_PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

export function parseDirectoryPageSize(raw: string | string[] | undefined): DirectoryPageSize {
  const text = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(text ?? "", 10)
  if (Number.isFinite(parsed) && isDirectoryPageSize(parsed)) return parsed
  return DIRECTORY_DEFAULT_PAGE_SIZE
}