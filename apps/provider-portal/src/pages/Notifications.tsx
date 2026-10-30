import {
  Activity,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCheck,
  FileCheck2,
  LogIn,
  RefreshCw,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill } from "@/components/provider/status-badges";
import {
  EmptyState,
  KpiCard,
  PageHeading,
  SectionCard,
  TableSkeleton,
} from "@/components/provider/ui-bits";
import type { Notification } from "@/lib/types";
import { useProvider } from "@/lib/provider-store";

const iconFor: Record<Notification["type"], typeof Bell> = {
  appointment: CalendarDays,
  check_in: LogIn,
  authorization: FileCheck2,
  verification: BadgeCheck,
  review: Star,
  sync: RefreshCw,
};

const toneFor: Record<Notification["type"], "brand" | "info" | "success" | "warning" | "neutral"> = {
  appointment: "info",
  check_in: "brand",
  authorization: "warning",
  verification: "success",
  review: "neutral",
  sync: "info",
};

export default function NotificationsPage() {
  const store = useProvider();
  const [tab, setTab] = useState("all");

  const unread = store.notifications.filter((n) => !n.read);

  const list = useMemo(() => {
    if (tab === "unread") return unread;
    if (tab === "all") return store.notifications;
    return store.notifications.filter((n) => n.type === tab);
  }, [store.notifications, unread, tab]);

  return (
    <div>
      <PageHeading
        title="Notifications"
        description="Operational alerts from bookings, encounters, HMO authorizations and integrations."
        actions={
          <Button variant="outline" onClick={() => store.markAllRead()} disabled={unread.length === 0}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total alerts" value={store.notifications.length} icon={Bell} tone="brand" />
        <KpiCard label="Unread" value={unread.length} icon={Bell} tone="warning" />
        <KpiCard
          label="Authorization alerts"
          value={store.notifications.filter((n) => n.type === "authorization").length}
          icon={FileCheck2}
          tone="info"
        />
        <KpiCard
          label="Check-in alerts"
          value={store.notifications.filter((n) => n.type === "check_in").length}
          icon={Activity}
          tone="success"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <div className="w-full overflow-x-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
            <TabsTrigger value="appointment">Bookings</TabsTrigger>
            <TabsTrigger value="check_in">Check-ins</TabsTrigger>
            <TabsTrigger value="authorization">Authorizations</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <SectionCard bodyClassName="p-0">
        {store.loading ? (
          <TableSkeleton />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing here"
            description="No notifications match this filter."
          />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((n) => {
              const Icon = iconFor[n.type];
              return (
                <li
                  key={n.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-neutral-soft text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Pill tone={toneFor[n.type]}>{n.type.replace("_", " ")}</Pill>
                      {!n.read ? <span className="size-2 rounded-full bg-brand" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="num mt-1 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  {!n.read ? (
                    <Button variant="ghost" size="sm" onClick={() => store.markRead(n.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
