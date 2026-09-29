"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight } from "lucide-react"
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
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadBooths } from "@/lib/supabase-queries"
import type { Database } from "@/lib/database.types"

const PAGE_SIZE = 12
type BoothRecord = Database["public"]["Tables"]["booths"]["Row"]

export default function BoothsPage() {
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [districtFilter, setDistrictFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const boothData = useAuthenticatedRows<BoothRecord>(loadBooths)
  const booths = boothData.rows
  const states = [...new Set(booths.map((booth) => booth.state).filter((value): value is string => Boolean(value)))].sort()
  const districts = [...new Set(booths.map((booth) => booth.district).filter((value): value is string => Boolean(value)))].sort()

  const filtered = useMemo(() => {
    return booths.filter((booth) => {
      const matchesSearch =
        search === "" ||
        booth.booth_code.toLowerCase().includes(search.toLowerCase()) ||
        booth.booth_name.toLowerCase().includes(search.toLowerCase()) ||
        booth.location.toLowerCase().includes(search.toLowerCase()) ||
        (booth.district ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (booth.state ?? "").toLowerCase().includes(search.toLowerCase())
      const matchesState = stateFilter === "all" || booth.state === stateFilter
      const matchesDistrict = districtFilter === "all" || booth.district === districtFilter
      return matchesSearch && matchesState && matchesDistrict
    })
  }, [booths, search, stateFilter, districtFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Booth Monitoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor all polling booths across regions in real-time
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search booth ID, name, region..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={stateFilter}
              onValueChange={(v) => {
                setStateFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              value={districtFilter}
              onValueChange={(v) => {
                setDistrictFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>
              {filtered.length} booth{filtered.length !== 1 ? "s" : ""} found
            </span>
            <span className="font-mono text-xs">
              Page {page + 1} of {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Booth ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Region</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                  <TableHead className="text-right text-xs">Capacity</TableHead>
                  <TableHead className="text-xs">Coordinates</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boothData.status !== "ready" ? (
                  <TableRow>
                    <TableCell colSpan={8} className={`py-8 text-center text-sm ${boothData.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                      {boothData.status === "loading" ? "Loading booths..." : boothData.status === "empty" ? "No booths are visible to the anonymous client. RLS may be filtering existing records." : boothData.error}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No booths match these filters.</TableCell></TableRow>
                ) : null}
                {boothData.status === "ready" && paged.map((booth) => (
                  <TableRow key={booth.id} className="group">
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {booth.booth_code}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {booth.booth_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs text-foreground">{booth.district ?? "District unavailable"}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {booth.state ?? "State unavailable"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{booth.location}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {booth.updated_at ? new Date(booth.updated_at).toLocaleString() : "Not recorded"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-foreground">
                      {booth.capacity ?? "Not recorded"}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{booth.latitude ?? "--"}, {booth.longitude ?? "--"}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/dashboard/booths/${booth.booth_code}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">View booth {booth.booth_code}</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum =
                  totalPages <= 5
                    ? i
                    : page < 3
                      ? i
                      : page > totalPages - 4
                        ? totalPages - 5 + i
                        : page - 2 + i
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
