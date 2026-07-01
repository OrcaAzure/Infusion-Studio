"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LayoutTextFlipProps {
  /** Static text before the flipping word */
  prefix: string;
  /** Words that cycle with a layout-shifting flip */
  words: string[];
  duration?: number;
  className?: string;
  wordClassName?: string;
}

/** Aceternity-style layout text flip — surrounding text reflows as words change */
export function LayoutTextFlip({
  prefix,
  words,
  duration = 2800,
  className,
  wordClassName,
}: LayoutTextFlipProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(timer);
  }, [words.length, duration]);

  const current = words[index] ?? words[0];

  return (
    <motion.h1
      layout
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl",
        className
      )}
    >
      <motion.span layout className="text-white/95">
        {prefix}
      </motion.span>
      <motion.span
        layout
        className={cn(
          "relative inline-flex min-w-[8ch] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-emerald-600/90 px-4 py-1.5 shadow-lg shadow-emerald-900/40 backdrop-blur-sm",
          wordClassName
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current}
            layout
            initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -24, opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-block whitespace-nowrap"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.h1>
  );
}
