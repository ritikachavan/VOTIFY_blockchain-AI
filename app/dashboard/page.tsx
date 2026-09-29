"use client";

import { useEffect, useState } from "react";
import { Vote, MapPin, AlertTriangle, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { VoteTrendChart } from "@/components/dashboard/vote-trend-chart";
import { CandidateChart } from "@/components/dashboard/candidate-chart";
import { AlertCard } from "@/components/dashboard/alert-card";
import { RegionTable } from "@/components/dashboard/region-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  alerts as demoAlerts,
  candidates as demoCandidates,
  hourlyVoteTrend as demoVoteTrend,
  kpiStats,
  regionStats,
  voterRegistry,
} from "@/lib/mock-data";
import type { Alert, Candidate, HourlyVote } from "@/lib/mock-data";
import Link from "next/link";

type Source = "loading" | "supabase" | "demo";

interface BoothActivity {
  id: number;
  voter_status: string;
  timestamp: string | null;
}

interface DashboardAlert {
  id: string;
  alert_type: string;
  severity: string | null;
  description: string | null;
  is_resolved: boolean | null
  created_at: string | null;
}

interface CandidateRecord {
  id: string;
  name: string | null;
}

function toDemoAlert(alert: Alert): DashboardAlert {
  return {
    id: alert.id,
    alert_type: alert.type,
    severity: alert.severity,
    description: alert.description,
    is_resolved: alert.resolved,
    created_at: alert.timestamp,
  };
}

function buildVoteTrend(rows: BoothActivity[]): HourlyVote[] {
  const hourlyVotes = new Map<string, number>();
  for (const row of rows) {
    if (row.voter_status !== "VOTE_RECORDED" || !row.timestamp) continue;
    const hour = `${new Date(row.timestamp).toISOString().slice(11, 13)}:00`;
    hourlyVotes.set(hour, (hourlyVotes.get(hour) ?? 0) + 1);
  }

  let cumulative = 0;
  return [...hourlyVotes.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([hour, votes]) => {
    cumulative += votes;
    return { hour, votes, cumulative };
  });
}

export default function DashboardPage() {
  const [totalVotes, setTotalVotes] = useState<number | null>(null);
  const [liveLogs, setLiveLogs] = useState<BoothActivity[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [voteSource, setVoteSource] = useState<Source>("loading");
  const [boothCount, setBoothCount] = useState<number | null>(null);
  const [boothSource, setBoothSource] = useState<Source>("loading");
  const [voterCount, setVoterCount] = useState<number | null>(null);
  const [votedCount, setVotedCount] = useState<number | null>(null);
  const [voterSource, setVoterSource] = useState<Source>("loading");
  const [activeAlertCount, setActiveAlertCount] = useState<number | null>(null);
  const [criticalAlertCount, setCriticalAlertCount] = useState<number | null>(null);
  const [dashboardAlerts, setDashboardAlerts] = useState<DashboardAlert[]>([]);
  const [alertSource, setAlertSource] = useState<Source>("loading");
  const [voteTrend, setVoteTrend] = useState<HourlyVote[]>([]);
  const [trendSource, setTrendSource] = useState<Source>("loading");
  const [candidateRecords, setCandidateRecords] = useState<CandidateRecord[] | null>(null);
  const [candidateSource, setCandidateSource] = useState<Source>("loading");

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const [
        voteCountResult,
        activityResult,
        boothsResult,
        votersResult,
        votedResult,
        alertsResult,
        criticalResult,
        candidatesResult,
      ] = await Promise.all([
        supabase.from("booth_activity").select("id", { count: "exact", head: true }).eq("voter_status", "VOTE_RECORDED"),
        supabase.from("booth_activity").select("id,voter_status,timestamp").order("id", { ascending: false }).limit(1000),
        supabase.from("booths").select("id", { count: "exact", head: true }),
        supabase.from("voters").select("id", { count: "exact", head: true }),
        supabase.from("voters").select("id", { count: "exact", head: true }).eq("has_voted", true),
        supabase.from("alerts").select("id,alert_type,severity,description,is_resolved,created_at", { count: "exact" }).eq("is_resolved", false).order("created_at", { ascending: false }).limit(4),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_resolved", false).eq("severity", "critical"),
        supabase.from("candidates").select("id,name").order("name", { ascending: true }),
      ]);

      if (!active) return;
      for (const [name, error] of [
        ["booth_activity vote count", voteCountResult.error],
        ["booth_activity rows", activityResult.error],
        ["booths count", boothsResult.error],
        ["voters count", votersResult.error],
        ["voted voter count", votedResult.error],
        ["alerts", alertsResult.error],
        ["critical alert count", criticalResult.error],
        ["candidates", candidatesResult.error],
      ] as const) {
        if (error && process.env.NODE_ENV !== "production") console.error(`Dashboard ${name} query failed`, error);
      }

      const activityRows = activityResult.error ? [] : activityResult.data ?? [];
      const hasActivityRows = activityRows.length > 0;
      const mockVotedCount = voterRegistry.filter((voter) => voter.hasVoted).length;
      const mockRecentAlerts = demoAlerts
        .filter((alert) => !alert.resolved)
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
        .slice(0, 4)
        .map(toDemoAlert);
      const actualAlerts = alertsResult.error ? [] : alertsResult.data ?? [];
      const actualCandidates = candidatesResult.error ? [] : candidatesResult.data ?? [];
      const actualTrend = buildVoteTrend(activityRows);
      const useLiveVoters = !votersResult.error && (votersResult.count ?? 0) > 0;
      const useLiveBooths = !boothsResult.error && (boothsResult.count ?? 0) > 0;
      const useLiveAlerts = !alertsResult.error && (alertsResult.count ?? 0) > 0 && actualAlerts.length > 0;
      const useLiveCandidates = !candidatesResult.error && actualCandidates.length > 0;
      const useLiveVotes = !voteCountResult.error && (voteCountResult.count ?? 0) > 0;

      setTotalVotes(useLiveVotes ? voteCountResult.count : kpiStats.totalVotes);
      setVoteSource(useLiveVotes ? "supabase" : "demo");
      setLiveLogs(hasActivityRows ? activityRows.slice(0, 5) : []);
      setActivityError(activityResult.error ? "Live activity query failed; no matching demo activity feed exists." : null);
      setIsActivityLoading(false);
      setBoothCount(useLiveBooths ? boothsResult.count : kpiStats.totalBooths);
      setBoothSource(useLiveBooths ? "supabase" : "demo");
      setVoterCount(useLiveVoters ? votersResult.count : voterRegistry.length);
      setVotedCount(useLiveVoters ? votedResult.count ?? 0 : mockVotedCount);
      setVoterSource(useLiveVoters ? "supabase" : "demo");
      setActiveAlertCount(useLiveAlerts ? alertsResult.count ?? actualAlerts.length : kpiStats.alertsCount);
      setCriticalAlertCount(useLiveAlerts ? criticalResult.count ?? 0 : kpiStats.criticalAlerts);
      setDashboardAlerts(useLiveAlerts ? actualAlerts : mockRecentAlerts);
      setAlertSource(useLiveAlerts ? "supabase" : "demo");
      setVoteTrend(actualTrend.length > 0 ? actualTrend : demoVoteTrend);
      setTrendSource(actualTrend.length > 0 ? "supabase" : "demo");
      setCandidateRecords(useLiveCandidates ? actualCandidates : null);
      setCandidateSource(useLiveCandidates ? "supabase" : "demo");
    };

    void loadDashboard().catch((error) => {
      if (process.env.NODE_ENV !== "production") console.error("Dashboard queries failed", error);
      if (!active) return;
      setTotalVotes(kpiStats.totalVotes);
      setVoteSource("demo");
      setBoothCount(kpiStats.totalBooths);
      setBoothSource("demo");
      setVoterCount(voterRegistry.length);
      setVotedCount(voterRegistry.filter((voter) => voter.hasVoted).length);
      setVoterSource("demo");
      setActiveAlertCount(kpiStats.alertsCount);
      setCriticalAlertCount(kpiStats.criticalAlerts);
      setDashboardAlerts(demoAlerts.filter((alert) => !alert.resolved).slice(0, 4).map(toDemoAlert));
      setAlertSource("demo");
      setVoteTrend(demoVoteTrend);
      setTrendSource("demo");
      setCandidateRecords(null);
      setCandidateSource("demo");
      setActivityError("Live activity is unavailable. No mock activity feed is defined.");
      setIsActivityLoading(false);
    });

    return () => { active = false };
  }, []);

  const turnout = voterCount && votedCount !== null
    ? `${Math.round((votedCount / voterCount) * 100)}%`
    : voterCount === 0 && votedCount === 0 ? "0%" : "Unavailable";
  const sourceLabel = (source: Source) => source === "supabase" ? "Live Supabase data" : source === "demo" ? "Demo fallback" : "Loading...";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground">Real-time election monitoring and data integrity overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Votes" value={totalVotes ?? "Loading..."} subtitle={sourceLabel(voteSource)} icon={Vote} />
        <KpiCard
          title={boothSource === "supabase" ? "Registered Booths" : "Active Booths"}
          value={boothSource === "supabase" ? boothCount ?? "Loading..." : `${kpiStats.activeBooths}/${boothCount ?? kpiStats.totalBooths}`}
          subtitle={sourceLabel(boothSource)}
          icon={MapPin}
          variant="success"
        />
        <KpiCard title="Active Alerts" value={activeAlertCount ?? "Loading..."} subtitle={`${criticalAlertCount ?? 0} critical · ${sourceLabel(alertSource)}`} icon={AlertTriangle} variant={criticalAlertCount && criticalAlertCount > 0 ? "destructive" : "warning"} />
        <KpiCard title="Turnout" value={turnout} subtitle={sourceLabel(voterSource)} icon={TrendingUp} variant="success" />
      </div>

      {(liveLogs.length > 0 || isActivityLoading || activityError) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3"><CardTitle className="text-xs font-semibold tracking-wider text-primary uppercase">Recent Station Activity</CardTitle></CardHeader>
          <CardContent className="py-2 text-sm">
            {activityError ? <p role="alert" className="text-xs text-destructive">{activityError}</p> : isActivityLoading ? <p className="text-xs text-muted-foreground">Loading activity...</p> : liveLogs.length === 0 ? <p className="text-xs text-muted-foreground">No activity records found.</p> : (
              <div className="space-y-2">{liveLogs.map((log) => <div key={log.id} className="flex items-center justify-between border-b border-border/50 pb-1 text-xs"><span className="font-mono text-muted-foreground">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "Time unavailable"}</span><span className={log.voter_status === "VOTE_RECORDED" ? "font-bold text-green-600" : "text-amber-600"}>{log.voter_status}</span></div>)}</div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <VoteTrendChart data={voteTrend.length ? voteTrend : demoVoteTrend} title={`Live Vote Trend · ${sourceLabel(trendSource)}`} />
        {candidateRecords ? (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Candidates · {sourceLabel(candidateSource)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">{candidateRecords.map((candidate) => <div key={candidate.id} className="border-b border-border/60 py-2 text-sm text-card-foreground">{candidate.name ?? "Unnamed candidate"}</div>)}<p className="text-xs text-muted-foreground">Vote totals are not available without an authorized result source.</p></CardContent>
          </Card>
        ) : <CandidateChart data={demoCandidates} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2"><div><CardTitle className="text-sm font-medium text-muted-foreground">Recent Alerts</CardTitle><p className="mt-1 text-[10px] text-muted-foreground">{sourceLabel(alertSource)}</p></div><Link href="/dashboard/alerts" className="text-xs font-medium text-primary hover:underline">View all</Link></CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">{dashboardAlerts.map((alert) => alertSource === "demo" ? <AlertCard key={alert.id} alert={demoAlerts.find((demoAlert) => demoAlert.id === alert.id)!} compact /> : <div key={alert.id} className="rounded-md border border-border p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-foreground">{alert.alert_type}</span><span className="text-[10px] uppercase text-muted-foreground">{alert.severity ?? "Unspecified"}</span></div>{alert.description && <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>}</div>)}</CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3"><RegionTable data={regionStats} limit={8} /></div>
      </div>
    </div>
  );
}
