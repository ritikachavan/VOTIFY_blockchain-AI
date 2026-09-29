"use client"

import { useEffect, useState } from "react"
import { FileBarChart, Download, Users, Vote, MapPin, AlertTriangle, Clock, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

type ReportType = "summary" | "state" | "integrity" | "incident"
type ReportStatus = "loading" | "error" | "ready"
interface ReportMetrics {
  voteEvents: number
  boothCount: number
  voterCount: number
  votedCount: number
  activeAlerts: number
  criticalAlerts: number
  boothCoverage: { state: string | null; district: string | null }[]
  latestStats: { total_entries: number | null; clean_entries: number | null; flagged_entries: number | null; duplicate_attempts: number | null; outside_geofence_count: number | null; timestamp: string | null } | null
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("summary")
  const [stateFilter, setStateFilter] = useState("all")
  const [status, setStatus] = useState<ReportStatus>("loading")
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    let active = true
    const loadReportData = async () => {
      try {
        const activityResult = await supabase.from("booth_activity").select("id", { count: "exact", head: true }).eq("voter_status", "VOTE_RECORDED")
        if (activityResult.error) throw activityResult.error
        const [booths, voters, voted, activeAlerts, criticalAlerts, coverage, stats] = await Promise.all([
          supabase.from("booths").select("id", { count: "exact", head: true }),
          supabase.from("voters").select("id", { count: "exact", head: true }),
          supabase.from("voters").select("id", { count: "exact", head: true }).eq("has_voted", true),
          supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_resolved", false),
          supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_resolved", false).eq("severity", "critical"),
          supabase.from("booths").select("state,district").order("state", { ascending: true }),
          supabase.from("election_stats").select("total_entries,clean_entries,flagged_entries,duplicate_attempts,outside_geofence_count,timestamp").order("timestamp", { ascending: false }).limit(1).maybeSingle(),
        ])
        const queryError = booths.error ?? voters.error ?? voted.error ?? activeAlerts.error ?? criticalAlerts.error ?? coverage.error ?? stats.error
        if (queryError) throw queryError
        if (active) {
          setMetrics({
            voteEvents: activityResult.count ?? 0,
            boothCount: booths.count ?? 0,
            voterCount: voters.count ?? 0,
            votedCount: voted.count ?? 0,
            activeAlerts: activeAlerts.count ?? 0,
            criticalAlerts: criticalAlerts.count ?? 0,
            boothCoverage: coverage.data ?? [],
            latestStats: stats.data,
          })
          setStatus("ready")
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.error("Unable to load report data", error)
        if (active) {
          setErrorMessage("Report data could not be loaded. Check Supabase configuration and RLS access.")
          setStatus("error")
        }
      }
    }
    void loadReportData()
    return () => { active = false }
  }, [])

  const states = [...new Set((metrics?.boothCoverage ?? []).map((item) => item.state).filter((value): value is string => Boolean(value)))].sort()
  const filteredCoverage = (metrics?.boothCoverage ?? []).filter((item) => stateFilter === "all" || item.state === stateFilter)
  const turnout = metrics && metrics.voterCount > 0 ? `${Math.round(metrics.votedCount / metrics.voterCount * 100)}%` : "Not available"

  function handleExport() {
    if (!metrics) return
    setIsExporting(true)
    const rows = [
      ["metric", "value"],
      ["vote_recorded_events", String(metrics.voteEvents)],
      ["registered_booths", status === "ready" ? String(metrics.boothCount) : "unavailable"],
      ["registered_voters", status === "ready" ? String(metrics.voterCount) : "unavailable"],
      ["voters_marked_voted", status === "ready" ? String(metrics.votedCount) : "unavailable"],
      ["turnout_of_registered_voters", status === "ready" ? turnout : "unavailable"],
      ["unresolved_alerts", status === "ready" ? String(metrics.activeAlerts) : "unavailable"],
      ["critical_alerts", status === "ready" ? String(metrics.criticalAlerts) : "unavailable"],
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "votify-report.csv"
    link.click()
    URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const privateValue = (value: number | null | undefined) => status === "ready" ? String(value ?? 0) : status === "loading" ? "Loading..." : "Unavailable"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-xl font-semibold tracking-tight text-foreground">Election Reports</h1><p className="text-sm text-muted-foreground">Report values are read from the supplied Supabase schema.</p></div><Button onClick={handleExport} disabled={!metrics || isExporting} className="gap-2"><Download className="h-4 w-4" />{isExporting ? "Generating..." : "Export CSV"}</Button></div>
      <div className="flex flex-wrap gap-3"><Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Report Type" /></SelectTrigger><SelectContent><SelectItem value="summary">Election Summary</SelectItem><SelectItem value="state">Booth Coverage</SelectItem><SelectItem value="integrity">Integrity Statistics</SelectItem><SelectItem value="incident">Alert Summary</SelectItem></SelectContent></Select>
        {reportType === "state" && <Select value={stateFilter} onValueChange={setStateFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent><SelectItem value="all">All States</SelectItem>{states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>}
      </div>
      <Card className="border-primary/20 bg-primary/5"><CardContent className="flex items-center gap-4 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><FileBarChart className="h-6 w-6 text-primary" /></div><div className="flex-1"><h2 className="text-sm font-semibold text-foreground">{reportType === "summary" ? "Election Summary" : reportType === "state" ? "Booth Coverage by State" : reportType === "integrity" ? "Latest Integrity Statistics" : "Alert Summary"}</h2><p className="text-xs text-muted-foreground">{status === "ready" ? "Loaded from Supabase" : status === "loading" ? "Loading report data..." : errorMessage}</p></div><Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs"><ShieldCheck className="mr-1 h-3 w-3" />Schema-backed</Badge></CardContent></Card>
      {status === "error" && <Card><CardContent role="alert" className="py-6 text-center text-sm text-destructive">{errorMessage}</CardContent></Card>}
      {reportType === "summary" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Vote} title="Vote-recorded events" value={metrics ? String(metrics.voteEvents) : status === "loading" ? "Loading..." : "Unavailable"} note="Public booth_activity count; no choices selected" />
        <MetricCard icon={MapPin} title="Registered Booths" value={privateValue(metrics?.boothCount)} note="Anonymous count; zero may mean RLS-filtered" />
        <MetricCard icon={Users} title="Registered Voters" value={privateValue(metrics?.voterCount)} note="Anonymous count; zero may mean RLS-filtered" />
        <MetricCard icon={Users} title="Voters Marked Voted" value={privateValue(metrics?.votedCount)} note={status === "ready" && metrics?.voterCount ? `${turnout} of registered records` : "Count hidden or no visible voter rows"} />
      </div>}
      {reportType === "state" && <Card><CardHeader><CardTitle className="text-sm font-medium text-foreground">Booth Coverage</CardTitle></CardHeader><CardContent>{status !== "ready" ? <p className="py-6 text-center text-sm text-muted-foreground">{status === "loading" ? "Loading booth coverage..." : "Booth coverage unavailable."}</p> : filteredCoverage.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No booths are visible anonymously; RLS may filter existing records.</p> : <div className="space-y-2">{filteredCoverage.map((row, index) => <div key={`${row.state ?? "unknown"}-${row.district ?? "unknown"}-${index}`} className="flex justify-between border-b border-border/60 py-2 text-sm"><span className="text-foreground">{row.state ?? "State not recorded"} / {row.district ?? "District not recorded"}</span><span className="text-xs text-muted-foreground">Booth record</span></div>)}</div>}</CardContent></Card>}
      {reportType === "integrity" && <Card><CardHeader><CardTitle className="text-sm font-medium text-foreground">Latest Election Statistics Record</CardTitle></CardHeader><CardContent>{status !== "ready" ? <p className="py-6 text-center text-sm text-muted-foreground">{status === "loading" ? "Loading statistics..." : "Statistics unavailable."}</p> : metrics?.latestStats ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Total", metrics.latestStats.total_entries], ["Clean", metrics.latestStats.clean_entries], ["Flagged", metrics.latestStats.flagged_entries], ["Duplicates", metrics.latestStats.duplicate_attempts], ["Outside geofence", metrics.latestStats.outside_geofence_count]].map(([label, value]) => <div key={String(label)}><p className="text-xs text-muted-foreground">{label}</p><p className="font-mono text-lg font-semibold text-foreground">{value ?? "--"}</p></div>)}</div> : <p className="py-6 text-center text-sm text-muted-foreground">No statistics are visible anonymously; RLS may filter existing records.</p>}</CardContent></Card>}
      {reportType === "incident" && <div className="grid gap-4 sm:grid-cols-2"><MetricCard icon={AlertTriangle} title="Unresolved Alerts" value={privateValue(metrics?.activeAlerts)} note="Anonymous count; zero may mean RLS-filtered" /><MetricCard icon={AlertTriangle} title="Critical Alerts" value={privateValue(metrics?.criticalAlerts)} note="Unresolved critical-severity count" /></div>}
      <Card><CardContent className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />Candidate results, EVM diagnostics, cryptographic ledger data, and hourly vote history are not part of the supplied schema or not publicly selectable; they are omitted.</CardContent></Card>
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, note }: { icon: typeof Vote; title: string; value: string; note: string }) {
  return <Card><CardContent className="flex items-start justify-between gap-4 p-5"><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p><p className="mt-1 font-mono text-2xl font-bold tabular-nums text-card-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><Icon className="h-5 w-5 text-primary" /></CardContent></Card>
}
