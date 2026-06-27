"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { CursorAura } from "@/components/ui/cursor-aura";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CursorAura />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
