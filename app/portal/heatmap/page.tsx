"use client"

import { useState } from "react"
import { ArrowLeft, MapPin, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthenticatedRows } from "@/lib/use-authenticated-rows"
import { loadBooths } from "@/lib/supabase-queries"
import type { Database } from "@/lib/database.types"

type BoothRecord = Pick<Database["public"]["Tables"]["booths"]["Row"], "id" | "booth_code" | "booth_name" | "location" | "district" | "state">
type DrillLevel = "state" | "district" | "booth"

export default function HeatmapPage() {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>("state")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const boothData = useAuthenticatedRows<BoothRecord>(loadBooths)
  const booths = boothData.rows
  const states = [...new Set(booths.map((booth) => booth.state).filter((value): value is string => Boolean(value)))].sort()
  const districts = selectedState
    ? [...new Set(booths.filter((booth) => booth.state === selectedState).map((booth) => booth.district).filter((value): value is string => Boolean(value)))].sort()
    : []
  const selectedBooths = selectedDistrict
    ? booths.filter((booth) => booth.state === selectedState && booth.district === selectedDistrict)
    : []

  function goBack() {
    if (drillLevel === "booth") {
      setSelectedDistrict(null)
      setDrillLevel("district")
    } else if (drillLevel === "district") {
      setSelectedState(null)
      setDrillLevel("state")
    }
  }

  const stateMessage = boothData.status === "loading"
    ? "Loading booth locations..."
    : boothData.status === "empty"
      ? "No booth locations are visible anonymously. RLS may be filtering existing records."
      : boothData.error

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {drillLevel !== "state" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}><ArrowLeft className="h-4 w-4" /><span className="sr-only">Go back</span></Button>}
        <div><h1 className="text-xl font-semibold tracking-tight text-foreground">Booth Location Explorer</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => { setDrillLevel("state"); setSelectedState(null); setSelectedDistrict(null) }} className="hover:text-foreground">All states</button>
            {selectedState && <><span>/</span><button onClick={() => { setDrillLevel("district"); setSelectedDistrict(null) }} className="hover:text-foreground">{selectedState}</button></>}
            {selectedDistrict && <><span>/</span><span className="text-foreground">{selectedDistrict}</span></>}
          </div>
        </div>
      </div>

      <Card><CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4 shrink-0 text-warning" />The schema contains booth locations but no vote totals, turnout denominator, risk status, or online status. This view shows registered booth coverage only.</CardContent></Card>

      {boothData.status !== "ready" ? <Card><CardContent className={`flex min-h-40 items-center justify-center p-6 text-center text-sm ${boothData.status === "error" ? "text-destructive" : "text-muted-foreground"}`} role={boothData.status === "error" ? "alert" : undefined}>{boothData.status === "error" ? boothData.error : stateMessage}</CardContent></Card> : <>
        {drillLevel === "state" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{states.map((state) => {
          const stateBooths = booths.filter((booth) => booth.state === state)
          const districtCount = new Set(stateBooths.map((booth) => booth.district).filter(Boolean)).size
          return <button key={state} onClick={() => { setSelectedState(state); setDrillLevel("district") }} className="text-left"><Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-card-foreground">{state}</h2><p className="text-xs text-muted-foreground">{districtCount} registered districts</p></div><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">{stateBooths.length}</div></div><p className="mt-4 text-xs text-muted-foreground">Registered booths</p></CardContent></Card></button>
        })}</div>}

        {drillLevel === "district" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{districts.map((district) => {
          const districtBooths = booths.filter((booth) => booth.state === selectedState && booth.district === district)
          return <button key={district} onClick={() => { setSelectedDistrict(district); setDrillLevel("booth") }} className="text-left"><Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"><CardContent className="p-5"><h2 className="text-base font-semibold text-card-foreground">{district}</h2><p className="mt-2 text-xs text-muted-foreground">{districtBooths.length} registered booths</p></CardContent></Card></button>
        })}{districts.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">No district values are recorded for this state.</CardContent></Card>}</div>}

        {drillLevel === "booth" && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectedBooths.map((booth) => <Card key={booth.id}><CardContent className="flex items-start gap-3 p-4"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><h2 className="text-sm font-medium text-card-foreground">{booth.booth_name}</h2><p className="font-mono text-xs text-muted-foreground">{booth.booth_code}</p><p className="mt-1 text-xs text-muted-foreground">{booth.location}</p></div></CardContent></Card>)}</div>}
      </>}
    </div>
  )
}
