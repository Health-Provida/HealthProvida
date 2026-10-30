import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CalendarDays,
  Bell,
  Building2,
  FileCheck2,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
  Receipt,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProvider } from "@/lib/provider-store";

const groups: { label: string; items: { title: string; url: string; icon: typeof Activity }[] }[] = [
  {
    label: "Home",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { title: "Appointments", url: "/appointments", icon: CalendarDays },
      { title: "Today's Schedule", url: "/today", icon: CalendarClock },
      { title: "Patient Encounters", url: "/encounters", icon: Activity },
    ],
  },
  {
    label: "Clinical / HMO",
    items: [
      { title: "HMO Patients", url: "/hmo-patients", icon: ShieldCheck },
      { title: "Authorizations", url: "/authorizations", icon: FileCheck2 },
    ],
  },
  {
    label: "Provider Management",
    items: [
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
      { title: "Schedules", url: "/schedules", icon: Users },
      { title: "Services & Tariffs", url: "/services", icon: Receipt },
      { title: "Facility Profile", url: "/facility", icon: Building2 },
      { title: "Verification", url: "/verification", icon: BadgeCheck },
    ],
  },
  {
    label: "Visibility",
    items: [
      { title: "Provider Performance", url: "/performance", icon: BarChart3 },
      { title: "Promoted Placement", url: "/promoted", icon: Megaphone },
    ],
  },
  {
    label: "Integrations",
    items: [{ title: "EMR Sync", url: "/emr-sync", icon: RefreshCw }],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { hospital, notifications } = useProvider();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-card ring-1 ring-sidebar-border">
            <span className="display text-sm font-bold text-sidebar-primary">HP</span>
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="display block truncate text-sm font-semibold text-sidebar-foreground">
              Health Provida
            </span>
            <span className="block truncate text-[11px] text-sidebar-foreground/60">
              Provider Portal
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-[0.08em] text-sidebar-foreground/45 uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                          {item.url === "/notifications" && unread > 0 ? (
                            <span className="num ml-auto rounded-full bg-sidebar-primary px-1.5 text-[11px] font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
                              {unread}
                            </span>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-xs font-medium text-sidebar-foreground">
          {hospital?.name ?? "Loading facility…"}
        </p>
        <p className="text-[11px] text-sidebar-foreground/60">
          {hospital ? `${hospital.city}, ${hospital.state}` : ""}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
