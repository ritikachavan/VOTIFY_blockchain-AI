"use client"

import { useEffect, useState } from "react"
import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

export function DashboardHeader() {
  const [criticalAlerts, setCriticalAlerts] = useState<number | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "available" | "unavailable">("checking")

  useEffect(() => {
    let active = true
    const loadCriticalAlerts = async () => {
      try {
        const { count, error } = await supabase
          .from("alerts")
          .select("id", { count: "exact", head: true })
          .eq("is_resolved", false)
          .eq("severity", "critical")
        if (error) throw error
        if (active) {
          setCriticalAlerts(count ?? 0)
          setConnectionStatus("available")
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.error("Unable to load critical alert count", error)
        if (active) setConnectionStatus("unavailable")
      }
    }
    void loadCriticalAlerts()
    return () => { active = false }
  }, [])

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Election Monitoring
        </span>
        <Badge variant="outline" className={`gap-1 text-xs ${connectionStatus === "available" ? "border-success/20 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === "available" ? "bg-success" : "bg-warning"}`} aria-hidden />
          {connectionStatus === "checking" ? "Checking" : connectionStatus === "available" ? "Connected" : "Unavailable"}
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {criticalAlerts !== null && criticalAlerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {criticalAlerts}
            </span>
          )}
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
