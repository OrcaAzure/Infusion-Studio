"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-20 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-stone-100 dark:text-stone-900"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
