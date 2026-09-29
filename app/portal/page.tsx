"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, Vote, MapPin, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface PublicActivity {
  id: number
  voter_status: string
  timestamp: string | null
}

type ActivityState = "loading" | "error" | "empty" | "ready"

export default function PublicPortalPage() {
  const [voteCount, setVoteCount] = useState<number | null>(null)
  const [activity, setActivity] = useState<PublicActivity[]>([])
  const [state, setState] = useState<ActivityState>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadActivity = async () => {
      try {
        const [countResult, rowsResult] = await Promise.all([
          supabase.from("booth_activity").select("id", { count: "exact", head: true }).eq("voter_status", "VOTE_RECORDED"),
          supabase.from("booth_activity").select("id,voter_status,timestamp").order("id", { ascending: false }).limit(20),
        ])
        if (countResult.error) throw countResult.error
        if (rowsResult.error) throw rowsResult.error
        if (active) {
          const rows = rowsResult.data ?? []
          setVoteCount(countResult.count ?? 0)
          setActivity(rows)
          setState(rows.length ? "ready" : "empty")
        }
      } catch (loadError) {
        if (process.env.NODE_ENV !== "production") console.error("Unable to load public booth activity", loadError)
        if (active) {
          setError("Public activity could not be loaded. Check Supabase configuration and RLS access.")
          setState("error")
        }
      }
    }
    void loadActivity()
    return () => { active = false }
  }, [])

  const value = (value: number | null) => state === "loading" ? "Loading..." : state === "error" ? "Unavailable" : value ?? 0

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="outline" className="mb-4 gap-1.5 border-warning/30 bg-warning/10 text-warning">
          <ShieldAlert className="h-3 w-3" />Activity feed only
        </Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Public Election Activity</h1>
        <p className="mx-auto mt-2 max-w-lg leading-relaxed text-muted-foreground">Publicly readable activity status and timestamps. This feed does not expose candidate choices.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Vote className="h-5 w-5 text-primary" /></div><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recorded Vote Events</p><p className="font-mono text-2xl font-bold tabular-nums text-card-foreground">{value(voteCount)}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><MapPin className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Booths</p><p className="font-mono text-lg font-bold text-card-foreground">Not publicly readable</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><TrendingUp className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Turnout</p><p className="font-mono text-lg font-bold text-card-foreground">Not derivable</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Recent Station Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {state === "loading" && <p className="py-6 text-center text-sm text-muted-foreground">Loading public activity...</p>}
          {state === "error" && <p role="alert" className="py-6 text-center text-sm text-destructive">{error}</p>}
          {state === "empty" && <p className="py-6 text-center text-sm text-muted-foreground">No activity records have been published.</p>}
          {activity.map((row) => <div key={row.id} className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-0">
            <span className="font-mono text-xs text-muted-foreground">{row.timestamp ? new Date(row.timestamp).toLocaleString("en-IN") : "Time not recorded"}</span>
            <Badge variant="outline" className="text-[10px]">{row.voter_status}</Badge>
          </div>)}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Candidate Results</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">The candidates and votes tables have no SELECT policy. Candidate results are not publicly available through the supplied RLS configuration.</CardContent></Card>
      <Card><CardContent className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />No ledger table or cryptographic verification fields are present in the supplied schema.</CardContent></Card>
    </div>
  )
}
