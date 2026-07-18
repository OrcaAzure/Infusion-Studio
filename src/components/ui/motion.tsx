"use client";

import { motion, useReducedMotion } from "framer-motion";

export const SNAPPY_EASE = [0.25, 0.1, 0.25, 1] as const;
export const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

/** Cap stagger so long lists don't cascade slowly on every tab visit. */
export function staggerDelay(index: number, step = 0.035, max = 0.14) {
  return Math.min(index * step, max);
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay, ease: SOFT_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Fast enter on tab change — CSS only, no remount key (keeps navigation snappy). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-content-enter">{children}</div>;
}

export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: SOFT_EASE } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Single grid/list cell — capped delay by index. */
export function MotionItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: staggerDelay(index), duration: 0.22, ease: SOFT_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
