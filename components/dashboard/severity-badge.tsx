import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AlertSeverity } from "@/lib/mock-data"

const severityConfig: Record<AlertSeverity, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  high: {
    label: "High",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  },
  critical: {
    label: "Critical",
    className: "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive",
  },
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config = severityConfig[severity]
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
