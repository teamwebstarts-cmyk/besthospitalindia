"use client"

/**
 * SpecialtyOfferingsManager — specialities & treatments management (pages/48).
 *
 * Local mock manager over the FROZEN specialty/treatment taxonomy
 * (data/specialties.ts, data/treatments.ts): the hospital's current offerings
 * start from the fixture lists and the user can add/remove entries locally.
 * Per spec acceptance: only known taxonomy entries can be selected — there is
 * no free-text creation, so no fabricated treatment claims can enter the
 * demo. "Save" is a local demo confirmation, never a backend write.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DemoFormFeedback, type DemoFormFeedbackState } from "@/features/content/demo-notice"
import { specialties, treatments } from "@/data"
import { CircleMinusIcon, CirclePlusIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpecialtyOfferingsManagerProps {
  /** Initial offering ids resolved from the demo hospital fixture. */
  initialSpecialtyIds: readonly string[]
  initialTreatmentIds: readonly string[]
  className?: string
}

export function SpecialtyOfferingsManager({
  initialSpecialtyIds,
  initialTreatmentIds,
  className,
}: SpecialtyOfferingsManagerProps) {
  const [specialtyIds, setSpecialtyIds] = React.useState<string[]>([...initialSpecialtyIds])
  const [treatmentIds, setTreatmentIds] = React.useState<string[]>([...initialTreatmentIds])
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("")
  const [selectedTreatment, setSelectedTreatment] = React.useState<string>("")
  const [feedback, setFeedback] = React.useState<DemoFormFeedbackState>({ kind: "idle" })
  const [pending, setPending] = React.useState(false)

  const dirty =
    !sameSet(specialtyIds, initialSpecialtyIds) || !sameSet(treatmentIds, initialTreatmentIds)

  // Taxonomy remaining pools — only entries NOT already offered.
  const availableSpecialties = specialties.filter((s) => !specialtyIds.includes(s.id))
  const availableTreatments = treatments.filter((t) => !treatmentIds.includes(t.id))

  // Treatments shown grouped under their specialty for scannable choices.
  const treatmentGroups = specialties
    .map((specialty) => ({
      specialty,
      items: availableTreatments.filter((t) => t.specialtyId === specialty.id),
    }))
    .filter((group) => group.items.length > 0)

  function addSpecialty() {
    if (!selectedSpecialty) return
    setSpecialtyIds((current) =>
      current.includes(selectedSpecialty) ? current : [...current, selectedSpecialty],
    )
    setSelectedSpecialty("")
    setFeedback({ kind: "idle" })
  }

  function removeSpecialty(id: string) {
    setSpecialtyIds((current) => current.filter((entry) => entry !== id))
    setFeedback({ kind: "idle" })
  }

  function addTreatment() {
    if (!selectedTreatment) return
    setTreatmentIds((current) =>
      current.includes(selectedTreatment) ? current : [...current, selectedTreatment],
    )
    setSelectedTreatment("")
    setFeedback({ kind: "idle" })
  }

  function removeTreatment(id: string) {
    setTreatmentIds((current) => current.filter((entry) => entry !== id))
    setFeedback({ kind: "idle" })
  }

  async function handleSave() {
    setPending(true)
    setFeedback({ kind: "submitting" })
    // Simulated latency to mirror other mock actions (300–600 ms).
    await new Promise((resolve) => setTimeout(resolve, 350))
    setPending(false)
    setFeedback({
      kind: "success",
      headline: "Offerings updated in this demo session.",
      lines: [
        `${specialtyIds.length} specialties and ${treatmentIds.length} treatments now selected (local state only).`,
        "Nothing was saved to a backend, and public listing changes require admin verification that the demo does not simulate.",
      ],
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
            <CardDescription>
              {specialtyIds.length} selected from the fixed demo taxonomy of {specialties.length}.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedSpecialty}
                onValueChange={(next) => setSelectedSpecialty(next ?? "")}
                disabled={pending || availableSpecialties.length === 0}
              >
                <SelectTrigger
                  id="add-specialty"
                  className="w-full flex-1"
                  aria-label="Add a specialty from the demo taxonomy"
                >
                  <SelectValue
                    placeholder={
                      availableSpecialties.length === 0 ? "All specialties added" : "Choose a specialty…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableSpecialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addSpecialty}
                disabled={pending || !selectedSpecialty}
                aria-controls="specialty-offering-list"
              >
                <CirclePlusIcon data-icon="inline-start" />
                Add
              </Button>
            </div>

            <ul id="specialty-offering-list" className="flex flex-wrap gap-2" aria-label="Current specialty offerings">
              {specialtyIds.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  No specialties selected — the hospital would not appear in specialty filters.
                </li>
              ) : (
                specialtyIds.map((id) => {
                  const specialty = specialties.find((s) => s.id === id)
                  return (
                    <li key={id}>
                      <Badge variant="secondary" className="h-7 gap-1 pr-1 pl-2.5">
                        {specialty?.name ?? id}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(id)}
                          disabled={pending}
                          aria-label={`Remove ${specialty?.name ?? id} from offerings`}
                          className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <XIcon aria-hidden className="size-3" />
                        </button>
                      </Badge>
                    </li>
                  )
                })
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Treatments */}
        <Card>
          <CardHeader>
            <CardTitle>Treatments</CardTitle>
            <CardDescription>
              {treatmentIds.length} selected from the fixed demo taxonomy of {treatments.length}.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedTreatment}
                onValueChange={(next) => setSelectedTreatment(next ?? "")}
                disabled={pending || availableTreatments.length === 0}
              >
                <SelectTrigger
                  id="add-treatment"
                  className="w-full flex-1"
                  aria-label="Add a treatment from the demo taxonomy"
                >
                  <SelectValue
                    placeholder={
                      availableTreatments.length === 0 ? "All treatments added" : "Choose a treatment…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {treatmentGroups.map((group) => (
                    <SelectGroup key={group.specialty.id}>
                      <SelectLabel>{group.specialty.name}</SelectLabel>
                      {group.items.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          {treatment.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addTreatment}
                disabled={pending || !selectedTreatment}
                aria-controls="treatment-offering-list"
              >
                <CirclePlusIcon data-icon="inline-start" />
                Add
              </Button>
            </div>

            <ul id="treatment-offering-list" className="flex flex-wrap gap-2" aria-label="Current treatment offerings">
              {treatmentIds.length === 0 ? (
                <li className="text-sm text-muted-foreground">No treatments selected yet.</li>
              ) : (
                treatmentIds.map((id) => {
                  const treatment = treatments.find((t) => t.id === id)
                  return (
                    <li key={id}>
                      <Badge variant="secondary" className="h-7 gap-1 pr-1 pl-2.5">
                        {treatment?.name ?? id}
                        <button
                          type="button"
                          onClick={() => removeTreatment(id)}
                          disabled={pending}
                          aria-label={`Remove ${treatment?.name ?? id} from offerings`}
                          className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <XIcon aria-hidden className="size-3" />
                        </button>
                      </Badge>
                    </li>
                  )
                })
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b [.border-b]:pb-4">
          <CardTitle>Offering details (demo)</CardTitle>
        </CardHeader>
        <CardContent className="gap-0 px-0 py-0">
          <ul className="divide-y text-sm">
            {treatmentIds.length === 0 ? (
              <li className="px-(--card-spacing) py-3 text-muted-foreground">
                No treatment rows to show — add treatments above to see their taxonomy details.
              </li>
            ) : (
              treatmentIds.map((id) => {
                const treatment = treatments.find((t) => t.id === id)
                if (!treatment) return null
                const specialty = specialties.find((s) => s.id === treatment.specialtyId)
                return (
                  <li
                    key={id}
                    className="flex flex-col gap-1 px-(--card-spacing) py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-foreground">{treatment.name}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{specialty?.name ?? treatment.specialtyId}</span>
                      <Separator orientation="vertical" className="data-vertical:h-3" />
                      <span className="font-mono">{treatment.id}</span>
                      <button
                        type="button"
                        onClick={() => removeTreatment(id)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <CircleMinusIcon aria-hidden className="size-3.5" />
                        Remove
                      </button>
                    </span>
                  </li>
                )
              })
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {dirty
            ? "You have unsaved demo changes."
            : "Offerings match the demo hospital fixture."}
        </p>
        <Button type="button" onClick={handleSave} disabled={pending || !dirty}>
          {pending ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : null}
          Save offerings (demo)
        </Button>
      </div>

      <DemoFormFeedback state={feedback} />
    </div>
  )
}

/** Set-equality by sorted join (order of selection is not semantic). */
function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return [...a].sort().join("\u0000") === [...b].sort().join("\u0000")
}
