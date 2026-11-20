"use client"

import type { ProviderRefType } from "@/types"

interface ProviderOption {
  id: string
  name: string
}

export function ProviderPreviewSelect({
  providerType,
  value,
  options,
  onChange,
}: {
  providerType: ProviderRefType
  value: string
  options: readonly ProviderOption[]
  onChange: (value: string) => void
}) {
  if (options.length <= 1) return null

  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm sm:min-w-64">
      <span className="text-xs font-medium text-muted-foreground">
        Switch {providerType === "doctor" ? "doctor profile" : "hospital profile"}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  )
}
