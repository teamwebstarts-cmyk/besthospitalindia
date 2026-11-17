import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GlobeIcon } from "lucide-react";

/**
 * IufInitiativeBanner — A07 (free consultation).
 *
 * Server component. Prominent "International Urban Forum Supported Initiative"
 * identity element using text + Badge only — no invented logos or assets.
 * The Forum page is a real public route (constants/routes), so the identity
 * links there for context.
 */
export function IufInitiativeBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex items-start gap-2">
        <GlobeIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span>
          <span className="font-medium">
            International Urban Forum Supported Initiative
          </span>
          <span className="block text-xs text-muted-foreground">
            This free consultation programme is presented under the Forum&apos;s supported-initiative
            banner on BestHospitalIndia (demo platform).
          </span>
        </span>
      </p>
      <Badge variant="secondary" className="shrink-0 self-start sm:self-center">
        IUF Supported Initiative
      </Badge>
    </div>
  );
}
