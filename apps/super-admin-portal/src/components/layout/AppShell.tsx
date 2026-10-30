import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { BRAND_ICON, BRAND_LOGO } from "@/lib/brand";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { navGroups, routeTitles } from "./nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

function NavLink({
  to,
  exact,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  exact?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  const { pathname } = useLocation();
  const isActive = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <img src={BRAND_ICON} alt="" className="h-8 w-8 rounded-md object-contain" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Health Provida</p>
          <p className="text-[11px] text-muted-foreground">Super Admin Portal</p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-5 px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      exact={item.exact}
                      icon={item.icon}
                      label={item.label}
                      onClick={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs font-medium text-sidebar-foreground">Platform status</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            All services operational · Lagos region
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const unread = notifications.filter((n) => n.unread).length;

  const segments = pathname.split("/").filter(Boolean);
  const base = segments.length ? `/${segments[0]}` : "/";
  const title = routeTitles[base] ?? "Dashboard";
  const detail = segments.length > 1 ? segments[segments.length - 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-sidebar shadow-xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground sm:block">
              <Link to="/" className="hover:text-foreground">
                Portal
              </Link>
              <span className="px-1.5">/</span>
              <span className={cn(detail ? "" : "text-foreground")}>{title}</span>
              {detail ? (
                <>
                  <span className="px-1.5">/</span>
                  <span className="text-foreground">{detail}</span>
                </>
              ) : null}
            </nav>
            <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
          </div>

          <div className="relative hidden w-72 md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers, tariffs, HMOs"
              className="pl-8"
              aria-label="Global search"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">{unread} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2.5">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.description}</span>
                  <span className="text-[11px] text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-left transition-colors hover:bg-accent">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  AO
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block text-xs font-medium">Adaeze Okafor</span>
                  <span className="block text-[10px] text-muted-foreground">Super Admin</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>adaeze.okafor@healthprovida.ng</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Portal settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin-users">Admin users</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">{children}</main>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <img src={BRAND_LOGO} alt="Health Provida" className="h-4 w-auto object-contain" />
              Internal governance console
            </span>
            <span>NDPR-compliant · Lagos, Nigeria</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
