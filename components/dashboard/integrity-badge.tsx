import { ShieldCheck, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function IntegrityBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        verified
          ? "bg-success/10 text-success border-success/20 hover:bg-success/10"
          : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10"
      )}
    >
      {verified ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <ShieldAlert className="h-3 w-3" />
      )}
      {verified ? "Verified" : "Unverified"}
    </Badge>
  )
}
