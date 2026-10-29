import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  BadgeCheck,
  Building2,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings,
  TestTubes,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { HealthProvidaLogo } from "@/components/brand";
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LAB_NAME } from "@/lib/lab-data";
import { useLab } from "@/lib/lab-store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/samples", label: "Samples", icon: TestTubes },
  { to: "/results", label: "Results", icon: FlaskConical },
  { to: "/tests", label: "Tests & Pricing", icon: Receipt },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/profile", label: "Laboratory Profile", icon: Building2 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { notifications } = useLab();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <nav className="space-y-1" aria-label="Main">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "bg-tint-blue text-brand-blue"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-blue" />
            )}
            <item.icon
              className={cn("h-[18px] w-[18px]", active ? "text-brand-blue" : "")}
              aria-hidden="true"
            />
            <span className="flex-1">{item.label}</span>
            {item.to === "/notifications" && unread > 0 && (
              <span className="rounded-full bg-brand-blue px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <Link
        to="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <HelpCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        Help &amp; Support
      </Link>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/60 px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tint-blue text-[12px] font-semibold text-brand-blue">
          MD
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-foreground">
            {LAB_NAME}
          </span>
          <span className="block text-[11px] text-muted-foreground">Laboratory account</span>
        </span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { notifications } = useLab();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] flex-col justify-between border-r border-border bg-card px-4 py-5 lg:flex">
        <div>
          <HealthProvidaLogo className="mb-6 px-1" />
          <NavItems />
        </div>
        <SidebarFooter />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-card p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <HealthProvidaLogo className="mb-6 px-1" />
              <NavItems onNavigate={() => setOpen(false)} />
              <div className="mt-6">
                <SidebarFooter />
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-2 md:flex">
            <span className="text-[15px] font-semibold text-foreground">{LAB_NAME}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-green/25 bg-tint-green px-2 py-0.5 text-[11px] font-medium text-brand-green">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified Laboratory
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="relative hidden sm:block">
              <span className="sr-only">Search orders, patients, samples</span>
              <Search
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, patients…"
                className="w-56 bg-background pl-9 lg:w-72"
              />
            </label>
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link to="/notifications" className="relative">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-green" />
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-tint-blue text-[12px] font-semibold text-brand-blue focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Account menu"
                >
                  MD
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-[13px] font-semibold">Dr. Ifeoma Nnamdi</span>
                  <span className="block text-[12px] font-normal text-muted-foreground">
                    Laboratory Administrator
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Laboratory profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
