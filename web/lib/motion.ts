import type { Variants } from "framer-motion";

export const EASE = [0.22, 0.72, 0.28, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const stagger = (gap = 0.07): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
});

export const slideIn = (from: "left" | "right"): Variants => ({
  hidden: { x: from === "right" ? "100%" : "-100%" },
  show: { x: 0, transition: { type: "spring", stiffness: 380, damping: 38 } },
  exit: { x: from === "right" ? "100%" : "-100%", transition: { duration: 0.22, ease: EASE } },
});

export const scrim: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const swapArt: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.15 } },
};
