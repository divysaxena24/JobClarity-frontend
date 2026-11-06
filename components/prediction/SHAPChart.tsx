"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  Cell,
} from "recharts";
import type { TopReason } from "@/types/prediction";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface SHAPChartProps {
  data: (TopReason & { rank: number; absImpact: number })[];
  selectedFeature: string | null;
  onSelectFeature: (feature: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TopReason & { rank: number; absImpact: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const isPositive = item.impact > 0;

  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-popover-foreground max-w-xs">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground">
          {item.feature}
        </code>
        <span className="text-[11px] font-semibold text-muted-foreground">
          Rank #{item.rank}
        </span>
      </div>

      <div className="mt-2 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">SHAP Attribution:</span>
          <span
            className={cn(
              "font-mono font-bold tabular-nums",
              isPositive
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isPositive ? "+" : ""}
            {item.impact.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Model Direction:</span>
          <span
            className={cn(
              "font-semibold text-[11px]",
              isPositive
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isPositive ? "Increases Fraud Risk" : "Decreases Fraud Risk"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Absolute Impact:</span>
          <span className="font-mono text-foreground">{item.absImpact.toFixed(4)}</span>
        </div>
      </div>

      <p className="mt-2.5 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
        Click bar to view full contribution breakdown.
      </p>
    </div>
  );
}

export function SHAPChart({
  data,
  selectedFeature,
  onSelectFeature,
}: SHAPChartProps) {
  const mounted = useMounted();

  // Compute symmetrical domain around zero so x=0 is dead-center
  const maxAbsVal = useMemo(() => {
    if (!data.length) return 1;
    const maxVal = Math.max(...data.map((d) => Math.abs(d.impact)));
    // Add small headroom for readability
    return maxVal > 0 ? Number((maxVal * 1.15).toFixed(2)) : 1;
  }, [data]);

  const chartHeight = useMemo(() => {
    return Math.max(data.length * 44 + 48, 220);
  }, [data.length]);

  if (!mounted) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl border border-border/60 bg-background/40"
        style={{ height: chartHeight }}
      >
        <span className="text-xs text-muted-foreground animate-pulse">
          Rendering SHAP Diverging Bar Chart...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Direction indicators above the zero line */}
      <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span aria-hidden="true">&larr;</span> Decreases Fraud Risk (Legitimacy)
        </span>
        <span className="font-mono text-xs text-muted-foreground">Zero Baseline (0.0)</span>
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          Increases Fraud Risk (Suspicion) <span aria-hidden="true">&rarr;</span>
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-border/70 bg-background/50 p-2 sm:p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={chartHeight} minWidth={320}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 12, right: 24, left: 32, bottom: 12 }}
          >
            <XAxis
              type="number"
              domain={[-maxAbsVal, maxAbsVal]}
              tickFormatter={(v: number) => v.toFixed(2)}
              stroke="currentColor"
              className="text-[11px] text-muted-foreground"
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
              axisLine={{ stroke: "currentColor", opacity: 0.3 }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="currentColor"
              className="font-mono text-xs text-foreground"
              width={100}
              tickLine={false}
              axisLine={{ stroke: "currentColor", opacity: 0.3 }}
              tick={({ x, y, payload }) => {
                const isSelected = selectedFeature === payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-8}
                      y={4}
                      textAnchor="end"
                      fill="currentColor"
                      className={cn(
                        "font-mono text-[11px] cursor-pointer transition-colors sm:text-xs",
                        isSelected
                          ? "font-bold text-primary underline"
                          : "text-foreground/90 hover:text-primary"
                      )}
                      onClick={() => onSelectFeature(payload.value)}
                    >
                      {payload.value.length > 14
                        ? `${payload.value.slice(0, 12)}…`
                        : payload.value}
                    </text>
                  </g>
                );
              }}
            />

            {/* Central Zero Baseline */}
            <ReferenceLine
              x={0}
              stroke="currentColor"
              strokeWidth={2}
              className="text-foreground/40"
              label={{
                value: "0.0",
                position: "top",
                fill: "currentColor",
                className: "text-[10px] font-mono opacity-60",
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "currentColor", opacity: 0.06 }}
            />

            <Bar
              dataKey="impact"
              radius={[4, 4, 4, 4]}
            >
              {data.map((entry) => {
                const isPositive = entry.impact > 0;
                const isSelected = selectedFeature === entry.feature;
                return (
                  <Cell
                    key={entry.feature}
                    fill={isPositive ? "#ef4444" : "#10b981"}
                    stroke={isSelected ? "#6366f1" : "transparent"}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer transition-all duration-200 hover:opacity-85"
                    onClick={() => onSelectFeature(entry.feature)}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
