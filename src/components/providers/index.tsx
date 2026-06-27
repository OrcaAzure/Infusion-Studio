"use client";

import "@/lib/offline-demo/install";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { CursorAura } from "@/components/ui/cursor-aura";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineDemoProvider } from "./offline-demo-provider";

const offlineDemo = process.env.NEXT_PUBLIC_OFFLINE_DEMO === "true";

const offlineSession = {
  user: {
    id: "demo-user",
    name: "Trial User",
    email: "trial@trial.com",
  },
  expires: "2099-01-01T00:00:00.000Z",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={offlineDemo ? offlineSession : undefined}>
      <ThemeProvider>
        <OfflineDemoProvider>
          {!offlineDemo && <ServiceWorkerRegister />}
          <CursorAura />
          {children}
          {!offlineDemo && <InstallPrompt />}
        </OfflineDemoProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
