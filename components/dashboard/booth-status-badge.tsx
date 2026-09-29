import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BoothStatus } from "@/lib/mock-data"

const statusConfig: Record<
  BoothStatus,
  { label: string; className: string; dotClass: string }
> = {
  online: {
    label: "Online",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/10",
    dotClass: "bg-success",
  },
  offline: {
    label: "Offline",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
    dotClass: "bg-destructive",
  },
  delayed: {
    label: "Delayed",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
    dotClass: "bg-warning",
  },
}

export function BoothStatusBadge({ status }: { status: BoothStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", config.className)}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)}
        aria-hidden
      />
      {config.label}
    </Badge>
  )
}
