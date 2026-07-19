"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    setTimeout(() => set({ message: null }), 2800);
  },
  clear: () => set({ message: null }),
}));

export function ToastHost() {
  const message = useToast((s) => s.message);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={cn(
            "fixed left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-700/20 bg-stone-900/95 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md dark:border-stone-300/20 dark:bg-stone-100/95 dark:text-stone-900",
            "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-4"
          )}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
