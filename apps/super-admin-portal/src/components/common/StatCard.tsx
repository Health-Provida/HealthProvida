import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  description,
}: {
  label: string;
  value: string;
  change?: number;
  description?: string;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {change !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                up ? "text-success" : "text-destructive",
              )}
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(change)}%
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
