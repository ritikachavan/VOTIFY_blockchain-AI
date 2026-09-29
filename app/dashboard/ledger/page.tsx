import { BookOpen, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Tamper-Proof Ledger
        </h1>
        <p className="text-sm text-muted-foreground">
          Ledger records are not available from the supplied database schema.
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Ledger Records"
          value="Unavailable"
          subtitle="No ledger table in schema"
          icon={BookOpen}
        />
        <KpiCard
          title="Verified"
          value="Unavailable"
          subtitle="No verification/hash fields"
          icon={BookOpen}
          variant="success"
        />
        <KpiCard
          title="Integrity Alerts"
          value="Unavailable"
          subtitle="Requires authorized alerts access"
          icon={ShieldAlert}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ledger Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The schema contains no ledger table or hash-chain fields (record hash,
          previous hash, block number, or verification status). booth_activity is
          not treated as a cryptographic ledger, so no demo records are shown.
        </CardContent>
      </Card>
    </div>
  )
}
