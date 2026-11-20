"use client"

import { useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  DIRECTORY_DEFAULT_PAGE_SIZE,
  DIRECTORY_PAGE_SIZE_OPTIONS,
  type DirectoryPageSize,
} from "./directory-page-size"

export interface DirectoryPageSizeControlProps {
  basePath: string
  value: DirectoryPageSize
  className?: string
}

export function DirectoryPageSizeControl({ basePath, value, className }: DirectoryPageSizeControlProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function onChange(next: string | null) {
    if (!next) return
    const parsed = Number.parseInt(next, 10) as DirectoryPageSize
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (parsed === DIRECTORY_DEFAULT_PAGE_SIZE) {
      params.delete("per")
    } else {
      params.set("per", String(parsed))
    }
    const query = params.toString()
    router.push(query === "" ? basePath : `${basePath}?${query}`)
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", className)}>
      <span id="directory-per-page-label">Show per page</span>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger
          className="h-9 w-[5.5rem] text-xs shadow-none"
          aria-labelledby="directory-per-page-label"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {DIRECTORY_PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}