"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, CheckCircle2, Clock, Copy, MapPin, MapPinOff, ShieldAlert, TrendingUp, Vote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { RegionTable } from "@/components/dashboard/region-table"
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadElectionStats } from "@/lib/supabase-queries"
import {
  candidates,
  candidateRaceData,
  kpiStats,
  regionStats,
  stateStats,
  stateTurnoutComparison,
  voteVelocity,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import type { Database } from "@/lib/database.types"

type ElectionStatsRecord = Database["public"]["Tables"]["election_stats"]["Row"]

const DEMO = "· Demo data"
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
  fontSize: "12px",
}
const axisProps = { stroke: "hsl(var(--muted-foreground))", fontSize: 11, tickLine: false, axisLine: false }
const primaryColor = "hsl(217, 91%, 60%)"
const mutedColor = "hsl(var(--muted-foreground))"

export default function AnalyticsPage() {
  const statsData = useAuthenticatedRows<ElectionStatsRecord>(loadElectionStats)
  const latest = statsData.rows[0]
  const metric = (value: number | null | undefined) => statsData.status === "ready" ? value ?? "Not recorded" : statsData.status === "loading" ? "Loading..." : "Unavailable"
  const showDemoKpis = statsData.status === "empty" || statsData.status === "error"
  const raceCandidates = Object.keys(candidateRaceData[0] ?? {}).filter((key) => key !== "hour")
  const raceColor = (name: string) => candidates.find((candidate) => candidate.name === name)?.partyColor ?? primaryColor
  const peakVelocity = voteVelocity.reduce((peak, point) => (point.velocity > peak.velocity ? point : peak), voteVelocity[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Live Election Analytics</h1>
        <p className="text-sm text-muted-foreground">Latest recorded activity statistics; rows are shown without assuming snapshot aggregation rules</p>
      </div>

      {showDemoKpis ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Votes" value={formatNumber(kpiStats.totalVotes)} subtitle={`Original demo dataset ${DEMO}`} icon={Vote} />
          <KpiCard title="Active Booths" value={`${kpiStats.activeBooths}/${kpiStats.totalBooths}`} subtitle="Online per demo booth set" icon={MapPin} variant="success" />
          <KpiCard title="Active Alerts" value={kpiStats.alertsCount} subtitle={`${kpiStats.criticalAlerts} critical`} icon={ShieldAlert} variant="destructive" />
          <KpiCard title="Turnout" value={`${kpiStats.turnoutPercentage}%`} subtitle="Demo votes vs expected" icon={TrendingUp} variant="success" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Entries" value={metric(latest?.total_entries)} subtitle="Latest statistics record" icon={BarChart3} />
          <KpiCard title="Clean Entries" value={metric(latest?.clean_entries)} subtitle="Latest statistics record" icon={CheckCircle2} variant="success" />
          <KpiCard title="Flagged Entries" value={metric(latest?.flagged_entries)} subtitle="Latest statistics record" icon={ShieldAlert} variant="warning" />
          <KpiCard title="Duplicate Attempts" value={metric(latest?.duplicate_attempts)} subtitle="Latest statistics record" icon={Copy} variant="destructive" />
        </div>
      )}

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vote Velocity {DEMO} · peak {formatNumber(peakVelocity.velocity)}/hr at {peakVelocity.hour}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={voteVelocity} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value: number, name: string) =>
                    name === "Velocity"
                      ? [`${formatNumber(value)} votes/hr`, name]
                      : [`${value > 0 ? "+" : ""}${formatNumber(value)} vs previous hour`, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="velocity" name="Velocity" fill={primaryColor} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="acceleration" name="Acceleration" stroke={mutedColor} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidate Race Tracker · Vote Share Over Time {DEMO}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={candidateRaceData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {raceCandidates.map((name) => (
                  <Line key={name} type="monotone" dataKey={name} name={name} stroke={raceColor(name)} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            State Turnout Comparison · Current vs Previous {DEMO}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2 pb-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stateTurnoutComparison} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="state" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="previous" name="Previous election" fill={mutedColor} radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current election" fill={primaryColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 px-4">
            {stateTurnoutComparison.map((entry) => (
              <span key={entry.state} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
                {entry.state}: <span className="font-mono text-foreground">{entry.current}%</span>{" "}
                <span className="font-mono">({entry.previous}%)</span>{" "}
                <span className={`font-mono ${entry.delta >= 0 ? "text-success" : "text-destructive"}`}>
                  {entry.delta >= 0 ? "+" : ""}
                  {entry.delta}%
                </span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">State Statistics {DEMO}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">State</TableHead>
                    <TableHead className="text-right text-xs">Booths</TableHead>
                    <TableHead className="text-right text-xs">Votes</TableHead>
                    <TableHead className="text-right text-xs">Expected</TableHead>
                    <TableHead className="text-xs">Turnout</TableHead>
                    <TableHead className="text-right text-xs">High Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateStats.map((state) => (
                    <TableRow key={state.name}>
                      <TableCell className="text-sm font-medium text-foreground">{state.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">
                        {state.activeBooths}/{state.totalBooths}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">{formatNumber(state.totalVotes)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatNumber(state.expectedVotes)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={state.turnoutPercentage} className="h-1.5 w-16" />
                          <span className="font-mono text-xs text-muted-foreground">{state.turnoutPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">{state.highRiskBooths}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <RegionTable data={regionStats} limit={10} />
      </div>

      <Card><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><MapPinOff className="h-4 w-4 shrink-0" />Only the election statistics table is sourced from Supabase election_stats. Every chart and table marked “{DEMO}” comes from the original deterministic demo datasets in lib/mock-data (kpiStats, voteVelocity, candidateRaceData, stateTurnoutComparison, stateStats, regionStats); the supplied schema has no candidate, turnout, or vote-velocity fields, so these are demo records, not Supabase data.</CardContent></Card>
      <Card><CardContent className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />These rows require an authenticated session under the election_stats RLS policy.</CardContent></Card>
    </div>
  )
}
