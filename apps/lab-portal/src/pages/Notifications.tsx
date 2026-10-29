import { Bell, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Surface } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/lab-store";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { notifications, markRead, markAllRead } = useLab();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread updates` : "You're all caught up"}
        actions={
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </Button>
        }
      />

      <Surface>
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Order, sample and result updates will appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 transition-colors",
                  !n.read && "bg-tint-blue/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    n.type === "success"
                      ? "bg-tint-green text-brand-green"
                      : "bg-tint-blue text-brand-blue",
                  )}
                >
                  {n.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-foreground">{n.title}</p>
                  <p className="text-[13px] text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </AppShell>
  );
}
