"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import type { TopReason } from "@/types/prediction";
import { FeatureImpactCard } from "@/components/prediction/FeatureImpactCard";

interface ReasonListProps {
  reasons: TopReason[];
}

export function ReasonList({ reasons }: ReasonListProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      aria-label="SHAP explanations"
      className="flex h-full flex-col rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xl shadow-primary/[0.06] backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400">
          <Lightbulb className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Key Factors Behind the Prediction
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            The most influential features affecting this prediction.
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        {reasons.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No significant factors were detected for this posting.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5 xl:gap-6">
            {reasons.map((reason, index) => (
              <FeatureImpactCard
                key={`${reason.feature}-${index}`}
                reason={reason}
                index={index}
                maxAbsImpact={Math.max(...reasons.map((r) => Math.abs(r.impact)))}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
