"use client"

import { useState, useMemo } from "react"
import { Activity, BatteryLow, Cpu, ShieldAlert, ShieldCheck } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { cn } from "@/lib/utils"
import { evmAuditEvents, evmDevices } from "@/lib/mock-data"
import type { EvmAuditEvent, EvmDevice, EvmStatus } from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"

const DISPLAY_LIMIT = 25

const statusConfig: Record<EvmStatus, { label: string; className: string; dotClass: string }> = {
  operational: {
    label: "Operational",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/10",
    dotClass: "bg-success",
  },
  warning: {
    label: "Warning",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10",
    dotClass: "bg-warning",
  },
  faulty: {
    label: "Faulty",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
    dotClass: "bg-destructive",
  },
  replaced: {
    label: "Replaced",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
    dotClass: "bg-muted-foreground",
  },
}

const severityConfig: Record<EvmAuditEvent["severity"], { label: string; className: string }> = {
  info: { label: "Info", className: "bg-muted text-muted-foreground border-border hover:bg-muted" },
  warning: { label: "Warning", className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10" },
  error: { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive" },
}

function EvmStatusBadge({ status }: { status: EvmStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", config.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} aria-hidden />
      {config.label}
    </Badge>
  )
}

function batteryClass(level: number) {
  return level < 30
    ? "text-destructive"
    : level < 60
      ? "text-warning"
      : "text-foreground"
}

export default function EvmAuditPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const devices = evmDevices
  const events = evmAuditEvents

  const filtered = useMemo(() => {
    return devices.filter((device) => statusFilter === "all" || device.status === statusFilter)
  }, [devices, statusFilter])

  const countByStatus = (status: EvmStatus) => devices.filter((device) => device.status === status).length
  const operational = countByStatus("operational")
  const warnings = countByStatus("warning")
  const faulty = countByStatus("faulty")
  const replaced = countByStatus("replaced")
  const lowBattery = devices.filter((device) => device.batteryLevel < 30).length
  const avgBattery = devices.length
    ? Math.round(devices.reduce((sum, device) => sum + device.batteryLevel, 0) / devices.length)
    : 0
  const avgTemperature = devices.length
    ? Math.round(devices.reduce((sum, device) => sum + device.temperature, 0) / devices.length)
    : 0
  const sealBreaches = devices.filter((device) => !device.sealIntact).length
  const unsynced = devices.filter((device) => !device.vvpatSynced).length
  const boothCount = new Set(devices.map((device) => device.boothId)).size
  const errorEvents = events.filter((event) => event.severity === "error").length
  const shownEvents = events.slice(0, DISPLAY_LIMIT)
  const totalVotesRecorded = devices.reduce((sum, device) => sum + device.totalVotesRecorded, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          EVM Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">
          Hardware inventory, diagnostics, and device audit events{" "}
          {devices.length > 0 && "· Demo data"}
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="EVM Devices"
          value={devices.length}
          subtitle={`${operational} operational · ${boothCount} booths`}
          icon={Cpu}
        />
        <KpiCard
          title="Warnings"
          value={warnings}
          subtitle={`${replaced} replaced devices`}
          icon={ShieldAlert}
          variant="warning"
        />
        <KpiCard
          title="Faulty Devices"
          value={faulty}
          subtitle={`${errorEvents} error events logged`}
          icon={ShieldAlert}
          variant="destructive"
        />
        <KpiCard
          title="Battery Health"
          value={`${avgBattery}%`}
          subtitle={`${lowBattery} devices below 30%`}
          icon={BatteryLow}
          variant={lowBattery > 0 ? "warning" : "success"}
        />
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              {(Object.keys(statusConfig) as EvmStatus[]).map((status) => (
                <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} device{filtered.length !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      {/* Fleet status + diagnostics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Device Fleet Status · Demo data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(statusConfig) as EvmStatus[]).map((status) => {
              const count = countByStatus(status)
              const share = devices.length ? Math.round((count / devices.length) * 100) : 0
              return (
                <div key={status} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <EvmStatusBadge status={status} />
                    <span className="font-mono text-sm text-foreground">{count}</span>
                  </div>
                  <Progress value={share} className="mt-3 h-1.5" />
                  <p className="mt-2 text-[10px] text-muted-foreground">{share}% of fleet</p>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              Avg battery: <span className={cn("font-mono", batteryClass(avgBattery))}>{avgBattery}%</span>
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              Low battery (&lt;30%): <span className="font-mono text-destructive">{lowBattery}</span>
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              Avg temperature: <span className="font-mono text-foreground">{avgTemperature}°C</span>
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              Seal intact: <span className="font-mono text-foreground">{devices.length - sealBreaches}/{devices.length}</span>
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              VVPAT synced: <span className="font-mono text-foreground">{devices.length - unsynced}/{devices.length}</span>
            </span>
            <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              Votes recorded: <span className="font-mono text-foreground">{formatNumber(totalVotesRecorded)}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Device inventory */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Device Inventory · Demo data
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No devices match the current filter
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Device</TableHead>
                    <TableHead className="text-xs">Booth</TableHead>
                    <TableHead className="text-xs">Model / Firmware</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Battery</TableHead>
                    <TableHead className="text-right text-xs">Temp</TableHead>
                    <TableHead className="text-right text-xs">Votes</TableHead>
                    <TableHead className="text-xs">Last Calibration</TableHead>
                    <TableHead className="text-xs">Seal / VVPAT</TableHead>
                    <TableHead className="text-right text-xs">Uptime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, DISPLAY_LIMIT).map((device: EvmDevice) => (
                    <TableRow key={device.id}>
                      <TableCell className="align-top">
                        <div className="font-mono text-xs text-foreground">{device.id}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{device.serialNumber}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="max-w-[160px] truncate text-xs text-foreground">{device.boothName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{device.boothId} · {device.state}</div>
                      </TableCell>
                      <TableCell className="align-top text-xs text-foreground">
                        {device.model}
                        <div className="font-mono text-[10px] text-muted-foreground">{device.firmwareVersion}</div>
                      </TableCell>
                      <TableCell className="align-top"><EvmStatusBadge status={device.status} /></TableCell>
                      <TableCell className={cn("text-right align-top font-mono text-xs", batteryClass(device.batteryLevel))}>
                        {device.batteryLevel}%
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs text-foreground">
                        {device.temperature}°C
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs text-foreground">
                        {formatNumber(device.totalVotesRecorded)}
                      </TableCell>
                      <TableCell className="align-top text-xs text-muted-foreground">
                        {new Date(device.lastCalibration).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        <span className={device.sealIntact ? "text-success" : "text-destructive"}>
                          {device.sealIntact ? "Seal intact" : "Seal breach"}
                        </span>
                        <div className={cn("text-[10px]", device.vvpatSynced ? "text-success" : "text-warning")}>
                          {device.vvpatSynced ? "VVPAT synced" : "VVPAT not synced"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs text-muted-foreground">
                        {Math.floor(device.uptimeMinutes / 60)}h {device.uptimeMinutes % 60}m
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filtered.length > DISPLAY_LIMIT && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Showing {DISPLAY_LIMIT} of {filtered.length} devices
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent audit events */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Audit Events · Demo data
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""} · {errorEvents} error
            {errorEvents !== 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {shownEvents.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No audit events recorded
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">Event ID</TableHead>
                    <TableHead className="text-xs">Device</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shownEvents.map((event: EvmAuditEvent) => {
                    const device = devices.find((candidate) => candidate.id === event.evmId)
                    const severity = severityConfig[event.severity]
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-[10px] text-muted-foreground">
                          {event.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap align-top">
                          <div className="font-mono text-xs text-foreground">{event.evmId}</div>
                          {device && (
                            <div className="text-[10px] text-muted-foreground">
                              {device.boothName} · {device.status}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline" className={cn("font-medium", severity.className)}>
                            {severity.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-xs text-foreground">{event.event}</div>
                          <div className="text-[10px] text-muted-foreground">{event.details}</div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {events.length > DISPLAY_LIMIT && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Showing {DISPLAY_LIMIT} of {events.length} events
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Hardware Audit Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Devices and audit events come from the original deterministic evmDevices
          and evmAuditEvents datasets in lib/mock-data.ts. The supplied Supabase
          schema defines no device inventory or device audit event table, so no live
          hardware rows exist; real Supabase EVM rows would take priority over this
          demo data if such tables existed.
        </CardContent>
      </Card>
    </div>
  )
}
