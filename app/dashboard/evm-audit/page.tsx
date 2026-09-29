"use client"

import { useState, useMemo } from "react"
import {
  Cpu,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"

export default function EvmAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          EVM Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">
          Hardware audit records are not available from the supplied database schema.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="EVM Devices" value="Unavailable" subtitle="No device table" icon={Cpu} />
        <KpiCard
          title="Warnings"
          value="Unavailable"
          subtitle="No device diagnostic fields"
          icon={ShieldAlert}
          variant="warning"
        />
        <KpiCard
          title="Faulty Devices"
          value="Unavailable"
          subtitle="No device status field"
          icon={ShieldAlert}
          variant="destructive"
        />
        <KpiCard title="Battery Health" value="Unavailable" subtitle="No battery field" icon={Cpu} />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Hardware Audit Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The supplied schema does not define EVM/device inventory, serial numbers,
          firmware, battery, calibration, seals, or device audit events. No demo
          diagnostics are presented as live records.
        </CardContent>
      </Card>
    </div>
  )
}
