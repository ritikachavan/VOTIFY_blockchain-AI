import { BookOpen, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { HashChainDisplay } from "@/components/dashboard/hash-chain-display"
import { ledgerRecords } from "@/lib/mock-data"

const DISPLAY_LIMIT = 20

export default function LedgerPage() {
  const totalRecords = ledgerRecords.length
  const verifiedRecords = ledgerRecords.filter((record) => record.verified).length
  const integrityAlerts = totalRecords - verifiedRecords
  const integrityRate = totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0
  const records = [...ledgerRecords].reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Tamper-Proof Ledger
        </h1>
        <p className="text-sm text-muted-foreground">
          Immutable hash-linked chain of vote records{" "}
          {ledgerRecords.length > 0 && "· Demo data"}
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Ledger Records"
          value={totalRecords}
          subtitle="Original demo ledger dataset"
          icon={BookOpen}
        />
        <KpiCard
          title="Verified"
          value={verifiedRecords}
          subtitle={`${integrityRate}% integrity rate`}
          icon={BookOpen}
          variant="success"
        />
        <KpiCard
          title="Integrity Alerts"
          value={integrityAlerts}
          subtitle="Unverified chain records"
          icon={ShieldAlert}
          variant="warning"
        />
      </div>

      {/* Hash chain */}
      <div className="space-y-1">
        {records.slice(0, DISPLAY_LIMIT).map((record, index) => (
          <HashChainDisplay
            key={record.id}
            record={record}
            showChainLink={index > 0}
          />
        ))}
        {records.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No ledger records are available
              </p>
            </CardContent>
          </Card>
        )}
        {records.length > DISPLAY_LIMIT && (
          <p className="text-center text-xs text-muted-foreground">
            Showing {DISPLAY_LIMIT} of {records.length} records
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ledger Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          These records come from the original ledgerRecords dataset in
          lib/mock-data.ts. The supplied Supabase schema contains no ledger table
          or hash-chain fields (record hash, previous hash, block number, or
          verification status), so no live ledger rows can be queried; real
          Supabase ledger rows would take priority over this demo data if such a
          table existed.
        </CardContent>
      </Card>
    </div>
  )
}
