import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MapPin, AlertTriangle } from "lucide-react"
import type { GeofenceStatus } from "@/lib/mock-data"

const config: Record<GeofenceStatus, { label: string; className: string; icon: typeof MapPin }> = {
  inside: {
    label: "Inside",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/10",
    icon: MapPin,
  },
  outside: {
    label: "Outside",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
    icon: AlertTriangle,
  },
}

export function GeofenceBadge({ status }: { status: GeofenceStatus }) {
  const c = config[status]
  const Icon = c.icon
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", c.className)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  )
}
