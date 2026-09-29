"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  BookOpen,
  Globe,
  Map,
  ShieldCheck,
  ScanEye,
  UserSearch,
  BarChart3,
  Cpu,
  FileBarChart,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Booth Monitoring", href: "/dashboard/booths", icon: MapPin },
  { title: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { title: "Ledger", href: "/dashboard/ledger", icon: BookOpen },
  { title: "Booth Activity", href: "/dashboard/booth-activity", icon: ScanEye },
  { title: "Voter Lookup", href: "/dashboard/voter-lookup", icon: UserSearch },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "EVM Audit", href: "/dashboard/evm-audit", icon: Cpu },
  { title: "Reports", href: "/dashboard/reports", icon: FileBarChart },
]

const publicNav = [
  { title: "Public Portal", href: "/portal", icon: Globe },
  { title: "Election Heatmap", href: "/portal/heatmap", icon: Map },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Votify
            </span>
            <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Election Monitor
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Command Center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Public Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Protected Data
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
