import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/format"
import type { RegionStats } from "@/lib/mock-data"

interface RegionTableProps {
  data: RegionStats[]
  limit?: number
}

export function RegionTable({ data, limit }: RegionTableProps) {
  const rows = limit ? data.slice(0, limit) : data

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Region Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Region</TableHead>
                <TableHead className="text-xs">State</TableHead>
                <TableHead className="text-right text-xs">Booths</TableHead>
                <TableHead className="text-right text-xs">Votes</TableHead>
                <TableHead className="text-xs">Turnout</TableHead>
                <TableHead className="text-xs">Leading</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((region) => (
                <TableRow key={region.name}>
                  <TableCell className="text-sm font-medium text-foreground">
                    {region.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {region.state}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-xs text-foreground">
                      {region.activeBooths}/{region.totalBooths}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground">
                    {formatNumber(region.totalVotes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={region.turnoutPercentage}
                        className="h-1.5 w-16"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {region.turnoutPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                    {region.leadingCandidate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
