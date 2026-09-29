"use client"

import { BarChart3, ShieldAlert, CheckCircle2, Copy, MapPinOff, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadElectionStats } from "@/lib/supabase-queries"
import type { Database } from "@/lib/database.types"

type ElectionStatsRecord = Database["public"]["Tables"]["election_stats"]["Row"]

export default function AnalyticsPage() {
  const statsData = useAuthenticatedRows<ElectionStatsRecord>(loadElectionStats)
  const latest = statsData.rows[0]
  const metric = (value: number | null | undefined) => statsData.status === "ready" ? value ?? "Not recorded" : statsData.status === "loading" ? "Loading..." : "Unavailable"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Live Election Analytics</h1>
        <p className="text-sm text-muted-foreground">Latest recorded activity statistics; rows are shown without assuming snapshot aggregation rules</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Entries" value={metric(latest?.total_entries)} subtitle="Latest statistics record" icon={BarChart3} />
        <KpiCard title="Clean Entries" value={metric(latest?.clean_entries)} subtitle="Latest statistics record" icon={CheckCircle2} variant="success" />
        <KpiCard title="Flagged Entries" value={metric(latest?.flagged_entries)} subtitle="Latest statistics record" icon={ShieldAlert} variant="warning" />
        <KpiCard title="Duplicate Attempts" value={metric(latest?.duplicate_attempts)} subtitle="Latest statistics record" icon={Copy} variant="destructive" />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Recent Election Statistics</CardTitle></CardHeader>
        <CardContent className="px-0 pb-0">
          {statsData.status !== "ready" ? (
            <div className={`px-6 py-12 text-center text-sm ${statsData.status === "error" ? "text-destructive" : "text-muted-foreground"}`} role={statsData.status === "error" ? "alert" : undefined}>
              {statsData.status === "loading" ? "Loading statistics..." : statsData.status === "empty" ? "No statistics are visible to the anonymous client. RLS may be filtering existing records." : statsData.error}
            </div>
          ) : <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-4 py-3 font-medium">Updated</th><th className="px-4 py-3 font-medium">Booth ID</th><th className="px-4 py-3 text-right font-medium">Total</th><th className="px-4 py-3 text-right font-medium">Clean</th><th className="px-4 py-3 text-right font-medium">Flagged</th><th className="px-4 py-3 text-right font-medium">Duplicates</th><th className="px-4 py-3 text-right font-medium">Outside geofence</th></tr></thead>
              <tbody>{statsData.rows.slice(0, 50).map((row) => <tr key={row.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.timestamp ? new Date(row.timestamp).toLocaleString() : "Not recorded"}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{row.booth_id ?? "Not assigned"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{row.total_entries ?? "--"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{row.clean_entries ?? "--"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{row.flagged_entries ?? "--"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{row.duplicate_attempts ?? "--"}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{row.outside_geofence_count ?? "--"}</td>
              </tr>)}</tbody>
            </table>
            {statsData.rows.length > 50 && <p className="py-3 text-center text-xs text-muted-foreground">Showing 50 of {statsData.rows.length} loaded records.</p>}
          </div>}
        </CardContent>
      </Card>

      <Card><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><MapPinOff className="h-4 w-4 shrink-0" />The schema provides no candidate result, historical vote-velocity, or turnout denominator fields. Candidate, race-projection, and turnout-comparison analytics are unavailable.</CardContent></Card>
      <Card><CardContent className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />These rows require an authenticated session under the election_stats RLS policy.</CardContent></Card>
    </div>
  )
}
