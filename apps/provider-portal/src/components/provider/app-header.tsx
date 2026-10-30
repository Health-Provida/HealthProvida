import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Building2, ChevronRight, LogOut, Search, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { VerificationBadge } from "@/components/provider/status-badges";
import { useProvider } from "@/lib/provider-store";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/appointments": "Appointments",
  "/today": "Today's Schedule",
  "/encounters": "Patient Encounters",
  "/hmo-patients": "HMO Patients",
  "/authorizations": "Authorizations",
  "/doctors": "Doctors",
  "/schedules": "Schedules",
  "/services": "Services & Tariffs",
  "/facility": "Facility Profile",
  "/verification": "Provider Verification",
  "/performance": "Provider Performance",
  "/promoted": "Promoted Placement",
  "/emr-sync": "EMR Sync",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

const sections: Record<string, string> = {
  "/appointments": "Operations",
  "/today": "Operations",
  "/encounters": "Operations",
  "/hmo-patients": "Clinical / HMO",
  "/authorizations": "Clinical / HMO",
  "/doctors": "Provider Management",
  "/schedules": "Provider Management",
  "/services": "Provider Management",
  "/facility": "Provider Management",
  "/verification": "Provider Management",
  "/performance": "Visibility",
  "/promoted": "Visibility",
  "/emr-sync": "Integrations",
  "/notifications": "Account",
  "/settings": "Account",
};

export function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { hospital, notifications, markAllRead, markRead } = useProvider();
  const [query, setQuery] = useState("");

  const base = `/${pathname.split("/")[1] ?? ""}`;
  const isDetail = pathname.startsWith("/appointments/") && pathname !== "/appointments";
  const title = isDetail ? "Appointment Detail" : (titles[base] ?? "Dashboard");
  const section = sections[base];
  const unread = notifications.filter((n) => !n.read).length;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/appointments?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex min-w-0 max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <SidebarTrigger className="shrink-0" />

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-muted-foreground"
          >
            <Link to="/" className="shrink-0 hover:text-foreground">
              Health Provida
            </Link>
            {section ? (
              <>
                <ChevronRight className="size-3 shrink-0" />
                <span className="shrink-0">{section}</span>
              </>
            ) : null}
            <ChevronRight className="size-3 shrink-0" />
            <span className="truncate text-foreground">{title}</span>
          </nav>
          <h2 className="display truncate text-base leading-6 font-semibold sm:text-lg">{title}</h2>
        </div>


        <form onSubmit={submitSearch} className="hidden lg:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient reference…"
              aria-label="Search patient reference"
              className="h-9 w-64 rounded-full bg-muted/50 pl-8"
            />
          </div>
        </form>

        {hospital ? (
          <div className="hidden shrink-0 xl:block">
            <VerificationBadge state={hospital.verification} />
          </div>
        ) : null}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Notifications">
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="num absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>
                Mark all read
              </Button>
            </div>
            <ScrollArea className="h-72">
              <ul className="divide-y divide-border">
                {notifications.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => void markRead(n.id)}
                      className="w-full px-3 py-2.5 text-left hover:bg-muted/60"
                    >
                      <div className="flex items-start gap-2">
                        {!n.read ? (
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        ) : (
                          <span className="mt-1.5 size-1.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="border-t border-border p-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/notifications">View all notifications</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-0 shrink-0 items-center gap-2 rounded-full border border-transparent px-1.5 py-1 transition-colors hover:border-border hover:bg-muted">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-1 ring-border">
                HP
              </span>
              <span className="hidden min-w-0 text-left md:block">
                <span className="block max-w-[10rem] truncate text-xs font-semibold">
                  {hospital?.name ?? "—"}
                </span>
                <span className="block text-[11px] text-muted-foreground">Facility Administrator</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">Chidinma Eze</p>
              <p className="text-xs font-normal text-muted-foreground">Facility Administrator</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/facility">
                <Building2 className="size-4" /> Facility profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/verification">
                <ShieldCheck className="size-4" /> Verification centre
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <User className="size-4" /> Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="size-4" /> Sign out (prototype)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
