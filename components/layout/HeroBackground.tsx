"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Ambient animated background for the hero — aurora blobs, floating
 * gradient orbs and a subtle grid. Purely decorative (aria-hidden).
 */
export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Top radial glow */}
      <div className="absolute left-1/2 top-[-22rem] h-[36rem] w-[68rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-cyan-500/15 blur-3xl" />

      {/* Floating gradient orbs */}
      <motion.div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/25 to-violet-600/10 blur-3xl"
        animate={prefersReducedMotion ? undefined : { y: [0, -28, 0], x: [0, 18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/20 to-sky-500/10 blur-3xl"
        animate={prefersReducedMotion ? undefined : { y: [0, 24, 0], x: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/15 to-violet-500/5 blur-3xl"
        animate={prefersReducedMotion ? undefined : { y: [0, -18, 0], x: [0, 14, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Faint grid, faded towards the edges */}
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
