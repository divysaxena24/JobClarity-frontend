"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedRiskGaugeProps {
  score: number; // 0 - 100
  riskLevel: string;
  className?: string;
  size?: number;
}

const GAUGE_CONFIG: Record<
  string,
  {
    gradientStart: string;
    gradientEnd: string;
    glowColor: string;
    textColor: string;
    badgeBg: string;
    badgeBorder: string;
  }
> = {
  Low: {
    gradientStart: "#10b981", // emerald-500
    gradientEnd: "#06b6d4",   // cyan-500
    glowColor: "rgba(16, 185, 129, 0.18)",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/25",
  },
  Medium: {
    gradientStart: "#f59e0b", // amber-500
    gradientEnd: "#eab308",   // yellow-500
    glowColor: "rgba(245, 158, 11, 0.18)",
    textColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/25",
  },
  High: {
    gradientStart: "#f97316", // orange-500
    gradientEnd: "#ef4444",   // red-500
    glowColor: "rgba(249, 115, 22, 0.22)",
    textColor: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-500/10",
    badgeBorder: "border-orange-500/25",
  },
  Critical: {
    gradientStart: "#f43f5e", // rose-500
    gradientEnd: "#dc2626",   // red-600
    glowColor: "rgba(220, 38, 38, 0.28)",
    textColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-500/10",
    badgeBorder: "border-red-500/25",
  },
};

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AnimatedRiskGauge({
  score,
  riskLevel,
  className,
  size = 148,
}: AnimatedRiskGaugeProps) {
  const safeScore = Number.isFinite(score) ? Math.min(Math.max(score, 0), 100) : 0;
  const config = GAUGE_CONFIG[riskLevel] ?? GAUGE_CONFIG.Low;
  const targetOffset = CIRCUMFERENCE * (1 - safeScore / 100);

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Background ambient glow matching risk level */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-28 rounded-full blur-2xl transition-all duration-700"
        style={{ backgroundColor: config.glowColor }}
      />

      {/* SVG Circular Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 120 120"
          role="progressbar"
          aria-label="Fraud risk score gauge"
          aria-valuenow={Math.round(safeScore)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <defs>
            <linearGradient
              id={`gauge-gradient-${riskLevel.toLowerCase()}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={config.gradientStart} />
              <stop offset="100%" stopColor={config.gradientEnd} />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            className="stroke-border/50"
          />

          {/* Animated active score progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            stroke={`url(#gauge-gradient-${riskLevel.toLowerCase()})`}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-[2rem]">
              {Math.round(safeScore)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Score / 100
            </span>
          </motion.div>
        </div>
      </div>

      {/* Mini tier pill below gauge */}
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          config.badgeBg,
          config.badgeBorder,
          config.textColor
        )}
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
        <span>{riskLevel} Risk</span>
      </div>
    </div>
  );
}
