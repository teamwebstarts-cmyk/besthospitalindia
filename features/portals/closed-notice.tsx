import { Card, CardContent } from "@/components/ui/card"

export function PortalClosedNotice({ audience }: { audience: "hospital" | "doctor" }) {
  const who = audience === "hospital" ? "Hospitals" : "Doctors"
  return (
    <Card className="my-8">
      <CardContent className="space-y-2 p-6 text-sm">
        <p className="font-medium text-foreground">{who} do not receive patient queries.</p>
        <p className="text-muted-foreground">
          Every query goes to the admin team and the city desk for Delhi or Indore. A profile is published only after admin approval.
        </p>
      </CardContent>
    </Card>
  )
}
