import type { TopReason } from "@/types/prediction";

export type SortOption = "abs" | "positive" | "negative";
export type CountOption = "top5" | "all";

export interface ProcessedReason {
  feature: string;
  impact: number;
  effect: string;
  absImpact: number;
  rank: number;
  totalAbsImpact: number;
}

export function processReasons(reasons: TopReason[]): ProcessedReason[] {
  if (!reasons || !Array.isArray(reasons) || reasons.length === 0) return [];

  const totalAbsImpact = reasons.reduce(
    (sum, r) => sum + Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
    0
  );

  return [...reasons]
    .map((r) => ({
      feature: r.feature || "unknown",
      impact: Number.isFinite(r.impact) ? r.impact : 0,
      effect: r.effect || (r.impact > 0 ? "Increases fraud risk" : "Decreases fraud risk"),
      absImpact: Math.abs(Number.isFinite(r.impact) ? r.impact : 0),
    }))
    .sort((a, b) => b.absImpact - a.absImpact)
    .map((r, idx) => ({
      ...r,
      rank: idx + 1,
      totalAbsImpact,
    }));
}

export function sortReasons(
  processedReasons: ProcessedReason[],
  sortBy: SortOption = "abs"
): ProcessedReason[] {
  const list = [...processedReasons];
  if (sortBy === "abs") {
    return list.sort((a, b) => b.absImpact - a.absImpact);
  }
  if (sortBy === "positive") {
    return list.sort((a, b) => b.impact - a.impact);
  }
  if (sortBy === "negative") {
    return list.sort((a, b) => a.impact - b.impact);
  }
  return list;
}

export function filterReasonsByCount(
  reasons: ProcessedReason[],
  count: CountOption = "all"
): ProcessedReason[] {
  if (count === "top5") return reasons.slice(0, 5);
  return reasons;
}
