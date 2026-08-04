"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RISK_STYLES: Record<string, string> = {
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-400",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:text-amber-400",
  High: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:border-orange-400/30 dark:text-orange-400",
  Critical: "border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:text-red-400",
};

const RISK_PULSE: Record<string, boolean> = {
  High: true,
  Critical: true,
};

interface RiskBadgeProps {
  level: string;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const styles = RISK_STYLES[level] ?? RISK_STYLES.Low;

  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 px-2.5 text-xs font-semibold", styles, className)}
    >
      <span className="relative flex size-2 items-center justify-center" aria-hidden="true">
        {RISK_PULSE[level] && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40" />
        )}
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {level}
    </Badge>
  );
}
