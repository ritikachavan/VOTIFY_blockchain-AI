"use client"

import { useState, useMemo } from "react"
import { Filter, AlertTriangle, Brain, ShieldAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadAlerts } from "@/lib/supabase-queries"
import { demoAlertRows } from "@/lib/demo-fallback"
import type { Database } from "@/lib/database.types"

type AlertRecord = Pick<
  Database["public"]["Tables"]["alerts"]["Row"],
  "id" | "alert_type" | "severity" | "description" | "booth_id" | "is_resolved" | "created_at"
>

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const alertData = useAuthenticatedRows<AlertRecord>(loadAlerts, demoAlertRows)
  const alerts = alertData.rows

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => {
        const matchesSeverity =
          severityFilter === "all" || a.severity === severityFilter
        const matchesType = typeFilter === "all" || a.alert_type === typeFilter
        return matchesSeverity && matchesType
      })
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )
  }, [severityFilter, typeFilter])

  const unresolvedCount = alerts.filter((a) => !a.is_resolved).length
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && !a.is_resolved
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Alert Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage all system alerts and AI-detected anomalies{" "}{alertData.source === "demo" && "· Demo data"}
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Active Alerts"
          value={alertData.status === "ready" ? unresolvedCount : alertData.status === "loading" ? "Loading..." : "Unavailable"}
          subtitle={alertData.source === "demo" ? "Original demo alert dataset" : `${alerts.length} returned anonymously`}
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Critical"
          value={alertData.status === "ready" ? criticalCount : alertData.status === "loading" ? "Loading..." : "Unavailable"}
          subtitle="Require immediate action"
          icon={ShieldAlert}
          variant="destructive"
        />
        <KpiCard
          title="AI Flagged"
          value="Not tracked"
          subtitle="No AI confidence field in schema"
          icon={Brain}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Array.from(new Set(alerts.map((alert) => alert.alert_type))).map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-3">
        {alertData.status === "ready" && filtered.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">{alert.alert_type}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{alert.severity ?? "Unspecified severity"}</span>
                  {alert.is_resolved && <span className="text-[10px] text-success">Resolved</span>}
                </div>
                {alert.description && <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>}
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {alert.created_at ? new Date(alert.created_at).toLocaleString() : "Timestamp unavailable"}
                  {alert.booth_id ? ` · Booth ${alert.booth_id}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {alertData.status !== "ready" ? (
          <Card>
            <CardContent className={`py-12 text-center text-sm ${alertData.status === "error" ? "text-destructive" : "text-muted-foreground"}`} role={alertData.status === "error" ? "alert" : undefined}>
              {alertData.status === "loading" ? "Loading alerts..." : alertData.status === "empty" ? "No alerts are visible to the anonymous client. RLS may be filtering existing records." : alertData.error}
            </CardContent>
          </Card>
        ) : filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No alerts match the current filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
