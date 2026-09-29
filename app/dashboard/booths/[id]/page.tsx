"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type BoothRecord = Pick<
  Database["public"]["Tables"]["booths"]["Row"],
  "id" | "booth_code" | "booth_name" | "location" | "district" | "state" | "latitude" | "longitude" | "capacity" | "created_at" | "updated_at"
>
type LoadState = "loading" | "error" | "not-found" | "ready"

export default function BoothDetailPage() {
  const { id: boothCode } = useParams<{ id: string }>()
  const [booth, setBooth] = useState<BoothRecord | null>(null)
  const [status, setStatus] = useState<LoadState>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadBooth = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("booths")
          .select("id,booth_code,booth_name,location,district,state,latitude,longitude,capacity,created_at,updated_at")
          .eq("booth_code", boothCode)
          .maybeSingle()
        if (queryError) throw queryError
        if (active) {
          setBooth(data)
          setStatus(data ? "ready" : "not-found")
        }
      } catch (loadError) {
        if (process.env.NODE_ENV !== "production") console.error("Unable to load booth detail", loadError)
        if (active) {
          setError("Booth details could not be loaded. Check Supabase configuration and RLS access.")
          setStatus("error")
        }
      }
    }
    void loadBooth()
    return () => { active = false }
  }, [boothCode])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard/booths"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back to booths</span></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{booth?.booth_name ?? "Booth Details"}</h1>
          <p className="text-sm text-muted-foreground">Booth record from Supabase</p>
        </div>
      </div>

      {status !== "ready" ? (
        <Card><CardContent className={`flex min-h-40 items-center justify-center p-6 text-center text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`} role={status === "error" ? "alert" : undefined}>
          {status === "loading" ? "Loading booth details..." : status === "not-found" ? `No booth with code ${boothCode} is visible anonymously. RLS may filter existing records.` : error}
        </CardContent></Card>
      ) : booth ? <>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{booth.booth_code}</span><span>/</span>
          <span>{booth.district ?? "District not recorded"}, {booth.state ?? "State not recorded"}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="flex items-center gap-3 p-4"><Hash className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Booth Code</p><p className="font-mono text-sm font-semibold text-card-foreground">{booth.booth_code}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Capacity</p><p className="font-mono text-lg font-semibold text-card-foreground">{booth.capacity ?? "Not recorded"}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4"><MapPin className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-semibold text-card-foreground">{booth.location}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Last Updated</p><p className="text-sm font-semibold text-card-foreground">{booth.updated_at ? new Date(booth.updated_at).toLocaleString() : "Not recorded"}</p></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registered Booth Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">District</p><p className="text-card-foreground">{booth.district ?? "Not recorded"}</p></div>
            <div><p className="text-xs text-muted-foreground">State</p><p className="text-card-foreground">{booth.state ?? "Not recorded"}</p></div>
            <div><p className="text-xs text-muted-foreground">Coordinates</p><p className="font-mono text-card-foreground">{booth.latitude ?? "--"}, {booth.longitude ?? "--"}</p></div>
            <div><p className="text-xs text-muted-foreground">Created</p><p className="text-card-foreground">{booth.created_at ? new Date(booth.created_at).toLocaleString() : "Not recorded"}</p></div>
          </CardContent>
        </Card>
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Live booth status, vote totals, officer assignment, activity history, risk score, and ledger records are not represented by the supplied schema.</CardContent></Card>
      </> : null}
    </div>
  )
}
