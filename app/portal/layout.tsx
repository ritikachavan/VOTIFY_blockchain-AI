import Link from "next/link"
import { ShieldCheck, Globe, Map, LayoutDashboard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/portal" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Votify
            </span>
          </Link>

          <nav className="ml-4 flex items-center gap-1">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Globe className="h-3.5 w-3.5" />
              Results
            </Link>
            <Link
              href="/portal/heatmap"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Map className="h-3.5 w-3.5" />
              Heatmap
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Authority View
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Votify Public Transparency Portal -- All data is verified through
            tamper-proof ledger technology
          </p>
        </div>
      </footer>
    </div>
  )
}
