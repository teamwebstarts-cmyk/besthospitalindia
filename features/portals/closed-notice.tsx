import { Building2Icon, StethoscopeIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function PortalClosedNotice({ audience }: { audience: "hospital" | "doctor" }) {
  const who = audience === "hospital" ? "Hospitals" : "Doctors"
  const Icon = audience === "hospital" ? Building2Icon : StethoscopeIcon

  return (
    <Card className="my-6 border-border/80 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="space-y-2 text-sm">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{who} do not receive patient queries</h1>
          <p className="leading-relaxed text-muted-foreground">
            Every patient enquiry is handled by the <span className="font-medium text-foreground">admin team</span> and the
            city desk for <span className="font-medium text-foreground">Delhi</span> or{" "}
            <span className="font-medium text-foreground">Indore</span>. Your public profile is published only after admin
            approval.
          </p>
          <p className="text-xs text-muted-foreground">
            Use the navigation to update your profile, credentials, and availability while your listing is being reviewed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}