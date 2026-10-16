import { cn } from "@/lib/utils";

export function HealthProvidaLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  if (!showWordmark) {
    return (
      <img
        src="/health-provida-icon.png"
        alt="Health Provida"
        className={cn("h-9 w-9 object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/health-provida-logo.png"
        alt="Health Provida"
        className="h-8 w-auto object-contain"
        width={1024}
        height={285}
      />
      <span className="sr-only">Health Provida Diagnostic Lab Portal</span>
    </div>
  );
}

export function HealthProvidaIcon({ className }: { className?: string }) {
  return (
    <img src="/health-provida-icon.png" alt="" aria-hidden="true" className={cn("h-8 w-8", className)} />
  );
}
