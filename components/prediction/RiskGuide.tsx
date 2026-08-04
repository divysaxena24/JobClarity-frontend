import { cn } from "@/lib/utils";

const RISK_LEVELS = [
  {
    level: "Low Risk",
    range: "0–25",
    description: "Likely legitimate posting.",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10",
  },
  {
    level: "Medium Risk",
    range: "26–50",
    description: "Review carefully before applying.",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10",
  },
  {
    level: "High Risk",
    range: "51–75",
    description: "Several suspicious indicators detected.",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    badge: "border-orange-500/30 bg-orange-500/10",
  },
  {
    level: "Critical Risk",
    range: "76–100",
    description: "Strong likelihood of fraudulent activity.",
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    badge: "border-red-500/30 bg-red-500/10",
  },
];

/**
 * Informational guide to the fraud risk score.
 * Display only — does not affect prediction logic.
 */
export function RiskGuide() {
  return (
    <section
      aria-label="Fraud risk score guide"
      className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-primary/[0.06] backdrop-blur-sm sm:p-6"
    >
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Risk Guide
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Understanding the Fraud Risk Score
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-6">
        {RISK_LEVELS.map((item) => (
          <li
            key={item.level}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border p-4 transition-colors duration-200 hover:border-ring/30",
              item.badge
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn("size-2.5 rounded-full", item.dot)}
                aria-hidden="true"
              />
              <span className={cn("text-sm font-semibold", item.text)}>
                {item.level}
              </span>
            </span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {item.range}
            </span>
            <span className="text-xs leading-5 text-muted-foreground">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
