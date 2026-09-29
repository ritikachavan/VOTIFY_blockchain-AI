"use client"

import { useMemo, useState } from "react"
import { Search, Filter, ScanEye, ShieldAlert, MapPinOff, Users, Clock, Eye, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadVoterActivity } from "@/lib/supabase-queries"
import { demoActivityRows } from "@/lib/demo-fallback"
import type { Database } from "@/lib/database.types"

const PAGE_SIZE = 15
type ActivityRecord = Pick<
  Database["public"]["Tables"]["voter_activity_log"]["Row"],
  "id" | "voter_id" | "booth_id" | "entry_time" | "exit_time" | "geofence_status" | "is_suspicious" | "flags"
>

function getFlags(flags: unknown[] | null): string[] {
  return Array.isArray(flags) ? flags.filter((flag): flag is string => typeof flag === "string") : []
}

export default function BoothActivityPage() {
  const [boothFilter, setBoothFilter] = useState("all")
  const [flagFilter, setFlagFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [selectedEntry, setSelectedEntry] = useState<ActivityRecord | null>(null)
  const activityData = useAuthenticatedRows<ActivityRecord>(loadVoterActivity, demoActivityRows)
  const entries = activityData.rows
  const boothIds = [...new Set(entries.map((entry) => entry.booth_id).filter((id): id is string => Boolean(id)))].sort()

  const filtered = useMemo(() => entries.filter((entry) => {
    const flags = getFlags(entry.flags)
    const matchesBooth = boothFilter === "all" || entry.booth_id === boothFilter
    const matchesFlag = flagFilter === "all"
      || (flagFilter === "flagged" && (entry.is_suspicious === true || flags.length > 0))
      || (flagFilter === "clean" && entry.is_suspicious !== true && flags.length === 0)
      || flags.includes(flagFilter)
    const query = search.toLowerCase()
    const matchesSearch = !query
      || entry.voter_id.toLowerCase().includes(query)
      || entry.id.toLowerCase().includes(query)
      || (entry.booth_id ?? "").toLowerCase().includes(query)
    return matchesBooth && matchesFlag && matchesSearch
  }), [entries, boothFilter, flagFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const isReady = activityData.status === "ready"
  const flaggedCount = entries.filter((entry) => entry.is_suspicious === true || getFlags(entry.flags).length > 0).length
  const outsideCount = entries.filter((entry) => entry.geofence_status === "outside" || getFlags(entry.flags).includes("outside_geofence")).length
  const duplicateCount = entries.filter((entry) => getFlags(entry.flags).some((flag) => flag.includes("duplicate"))).length
  const valueOrStatus = (value: number) => isReady ? value : activityData.status === "loading" ? "Loading..." : "Unavailable"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Booth Voter Activity</h1>
        <p className="text-sm text-muted-foreground">Voter activity audit records with geofence and suspicious-entry fields</p>
        <Badge variant="outline" className="mt-2 gap-1.5 border-warning/30 bg-warning/5 text-warning">
          <ShieldAlert className="h-3 w-3" />
          Restricted Access -- Authorized Officials Only
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Entries" value={valueOrStatus(entries.length)} subtitle="Activity records" icon={Users} />
        <KpiCard title="Flagged Entries" value={valueOrStatus(flaggedCount)} subtitle="Marked suspicious or carrying flags" icon={ShieldAlert} variant="destructive" />
        <KpiCard title="Outside Geofence" value={valueOrStatus(outsideCount)} subtitle="Recorded outside or flagged" icon={MapPinOff} variant="warning" />
        <KpiCard title="Duplicate Attempts" value={valueOrStatus(duplicateCount)} subtitle="Duplicate flags recorded" icon={Copy} variant="destructive" />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search voter ID, entry ID, booth ID..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={boothFilter} onValueChange={(value) => { setBoothFilter(value); setPage(0) }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Booth" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Booths</SelectItem>
                {boothIds.map((boothId) => <SelectItem key={boothId} value={boothId}>{boothId}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={flagFilter} onValueChange={(value) => { setFlagFilter(value); setPage(0) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Flag Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="clean">No Flags</SelectItem>
                <SelectItem value="duplicate_entry">Duplicate Entry</SelectItem>
                <SelectItem value="outside_geofence">Outside Geofence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2"><ScanEye className="h-4 w-4" />{isReady ? `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} found` : "Activity records"}</span>
            <span className="font-mono text-xs">Page {page + 1} of {totalPages}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Time</TableHead><TableHead className="text-xs">Voter ID</TableHead><TableHead className="text-xs">Booth ID</TableHead><TableHead className="text-xs">Geofence</TableHead><TableHead className="text-xs">Flags</TableHead><TableHead className="w-10 text-xs">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {activityData.status !== "ready" ? (
                  <TableRow><TableCell colSpan={6} className={`py-12 text-center text-sm ${activityData.status === "error" ? "text-destructive" : "text-muted-foreground"}`} role={activityData.status === "error" ? "alert" : undefined}>
                    {activityData.status === "loading" ? "Loading activity records..." : activityData.status === "empty" ? "No activity is visible to the anonymous client. RLS may be filtering existing records." : activityData.error}
                  </TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No entries match the current filters.</TableCell></TableRow>
                ) : paged.map((entry) => {
                  const flags = getFlags(entry.flags)
                  return <TableRow key={entry.id} className={entry.is_suspicious ? "bg-destructive/[0.03]" : "group"}>
                    <TableCell className="text-xs text-muted-foreground"><div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{entry.entry_time ? new Date(entry.entry_time).toLocaleTimeString("en-IN") : "Time unavailable"}</div><span className="block text-[10px] text-muted-foreground/70">{entry.entry_time ? new Date(entry.entry_time).toLocaleDateString("en-IN") : ""}</span></TableCell>
                    <TableCell className="font-mono text-sm font-medium text-foreground">{entry.voter_id}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{entry.booth_id ?? "Not assigned"}</TableCell>
                    <TableCell>{entry.geofence_status ? <Badge variant="outline" className="text-[10px]">{entry.geofence_status}</Badge> : <span className="text-xs text-muted-foreground">Not recorded</span>}</TableCell>
                    <TableCell className="text-xs">{flags.length ? flags.join(", ") : entry.is_suspicious ? "Suspicious (no flag detail)" : "None recorded"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedEntry(entry)} aria-label={`View activity ${entry.id}`}><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                })}
              </TableBody>
            </Table>
          </div>
          {isReady && totalPages > 1 && <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>}
        </CardContent>
      </Card>

      <Dialog open={selectedEntry !== null} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          {selectedEntry && <>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ScanEye className="h-5 w-5 text-primary" />Activity Record</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div><p className="text-[10px] uppercase text-muted-foreground">Record ID</p><p className="break-all font-mono text-xs text-foreground">{selectedEntry.id}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Entry time</p><p className="text-xs text-foreground">{selectedEntry.entry_time ? new Date(selectedEntry.entry_time).toLocaleString("en-IN") : "Not recorded"}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Exit time</p><p className="text-xs text-foreground">{selectedEntry.exit_time ? new Date(selectedEntry.exit_time).toLocaleString("en-IN") : "Not recorded"}</p></div>
                <div><p className="text-[10px] uppercase text-muted-foreground">Booth ID</p><p className="break-all font-mono text-xs text-foreground">{selectedEntry.booth_id ?? "Not assigned"}</p></div>
              </div>
              <div><p className="text-[10px] uppercase text-muted-foreground">Voter ID</p><p className="font-mono text-sm text-foreground">{selectedEntry.voter_id}</p></div>
              <Separator />
              <div className="flex flex-wrap items-center gap-4">
                <div><p className="mb-1 text-[10px] uppercase text-muted-foreground">Geofence status</p><span className="text-sm text-foreground">{selectedEntry.geofence_status ?? "Not recorded"}</span></div>
                <div><p className="mb-1 text-[10px] uppercase text-muted-foreground">Suspicious</p><Badge variant="outline" className={selectedEntry.is_suspicious ? "border-destructive/30 text-destructive" : ""}>{selectedEntry.is_suspicious ? "Yes" : "No"}</Badge></div>
              </div>
              <div><p className="mb-1 text-[10px] uppercase text-muted-foreground">Flags</p><p className="text-sm text-foreground">{getFlags(selectedEntry.flags).join(", ") || "None recorded"}</p></div>
              <p className="text-xs text-muted-foreground">Image and precise coordinates are omitted from this view.</p>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
