import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VoterFlag } from "@/lib/mock-data"

const flagConfig: Record<
  Exclude<VoterFlag, null>,
  { label: string; className: string }
> = {
  duplicate: {
    label: "Duplicate Entry",
    className:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  },
  outside_geofence: {
    label: "Outside Geofence",
    className:
      "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  rapid_entry: {
    label: "Rapid Entry",
    className:
      "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
}

export function VoterFlagBadge({ flag }: { flag: VoterFlag }) {
  if (flag === null) return null
  const c = flagConfig[flag]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}
