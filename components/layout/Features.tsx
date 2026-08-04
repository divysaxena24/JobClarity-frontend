"use client";

import { motion, type Variants } from "framer-motion";
import { Activity, Cpu, Radar } from "lucide-react";

const FEATURES = [
  {
    icon: Radar,
    title: "Pattern-based detection",
    description:
      "Detects suspicious wording, unrealistic offers, and common scam indicators.",
    gradient: "from-indigo-500/20 to-violet-500/10 text-indigo-600 dark:text-indigo-300",
    glow: "group-hover:shadow-indigo-500/20",
  },
  {
    icon: Cpu,
    title: "Fast & accurate",
    description:
      "Powered by an optimized XGBoost model delivering predictions in milliseconds.",
    gradient: "from-cyan-500/20 to-sky-500/10 text-cyan-600 dark:text-cyan-300",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: Activity,
    title: "Explainable results",
    description:
      "Every prediction includes transparent explanations powered by SHAP.",
    gradient: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-300",
    glow: "group-hover:shadow-emerald-500/20",
  },
] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Features() {
  return (
    <section aria-label="Why JobClarity" className="relative border-t border-border/50 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 sm:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description, gradient, glow }) => (
            <motion.article
              key={title}
              variants={item}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-ring/40 hover:shadow-xl hover:shadow-primary/[0.06]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span
                className={`flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg ${glow}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
