import {
  AlertTriangle,
  Brain,
  Cpu,
  Link2,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SeverityBadge } from "./severity-badge"
import { cn } from "@/lib/utils"
import type { Alert } from "@/lib/mock-data"
import { format } from "date-fns"

const typeIcons: Record<string, typeof AlertTriangle> = {
  anomaly: AlertTriangle,
  hardware: Cpu,
  fraud: Brain,
  sync: Link2,
  integrity: ShieldAlert,
}

const typeLabels: Record<string, string> = {
  anomaly: "Anomaly",
  hardware: "Hardware",
  fraud: "AI Fraud Detection",
  sync: "Sync Issue",
  integrity: "Integrity",
}

interface AlertCardProps {
  alert: Alert
  compact?: boolean
}

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  const Icon = typeIcons[alert.type] || AlertTriangle

  return (
    <Card
      className={cn(
        "transition-colors",
        alert.severity === "critical" && !alert.resolved && "border-destructive/50",
        alert.resolved && "opacity-60"
      )}
    >
      <CardContent className={cn("flex gap-3", compact ? "p-3" : "p-4")}>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            alert.severity === "critical"
              ? "bg-destructive/10 text-destructive"
              : alert.severity === "high"
                ? "bg-destructive/10 text-destructive"
                : alert.severity === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight text-card-foreground">
              {alert.title}
            </p>
            <SeverityBadge severity={alert.severity} />
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {alert.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{alert.boothId}</span>
            <span aria-hidden>{"/"}</span>
            <span>{alert.region}</span>
            <span aria-hidden>{"/"}</span>
            <span>{typeLabels[alert.type]}</span>
            {alert.aiConfidence && (
              <>
                <span aria-hidden>{"/"}</span>
                <span className="font-mono text-primary">
                  AI: {alert.aiConfidence}%
                </span>
              </>
            )}
            <span className="ml-auto">
              {format(new Date(alert.timestamp), "HH:mm")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
