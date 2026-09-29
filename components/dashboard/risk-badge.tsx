import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/mock-data"

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: "Low Risk",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/10",
  },
  medium: {
    label: "Medium Risk",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
  },
  high: {
    label: "High Risk",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  },
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = riskConfig[level]
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
