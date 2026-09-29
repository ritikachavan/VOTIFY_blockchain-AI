import { ArrowRight, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { IntegrityBadge } from "./integrity-badge"
import { cn } from "@/lib/utils"
import type { LedgerRecord } from "@/lib/mock-data"
import { format } from "date-fns"

interface HashChainDisplayProps {
  record: LedgerRecord
  showChainLink?: boolean
}

export function HashChainDisplay({
  record,
  showChainLink = true,
}: HashChainDisplayProps) {
  return (
    <div className="flex items-stretch gap-2">
      {showChainLink && (
        <div className="flex flex-col items-center gap-1 py-2">
          <Link2 className="h-3 w-3 text-muted-foreground" />
          <div className="w-px flex-1 bg-border" />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <Card
        className={cn(
          "flex-1 transition-colors",
          !record.verified && "border-destructive/30"
        )}
      >
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                Block #{record.blockNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                {record.id}
              </span>
            </div>
            <IntegrityBadge verified={record.verified} />
          </div>
          <div className="grid gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-medium uppercase tracking-wider text-muted-foreground">
                Hash
              </span>
              <code className="flex-1 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-card-foreground">
                {record.hash}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-medium uppercase tracking-wider text-muted-foreground">
                Prev
              </span>
              <code className="flex-1 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                {record.prevHash}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-medium uppercase tracking-wider text-muted-foreground">
                Data
              </span>
              <code className="flex-1 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-card-foreground">
                {record.dataHash}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{record.boothId}</span>
            <span>{record.boothName}</span>
            <span className="ml-auto">
              {format(new Date(record.timestamp), "MMM d, HH:mm:ss")}
            </span>
            <span className="font-mono text-card-foreground">
              {record.voteCount} votes
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
