"use client";

import "@/lib/offline-demo/install";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { CursorAura } from "@/components/ui/cursor-aura";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineDemoProvider } from "./offline-demo-provider";
import { ToastHost } from "@/components/ui/toast";

const offlineDemo = process.env.NEXT_PUBLIC_OFFLINE_DEMO === "true";
const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

const trialSession = {
  user: {
    id: "trial-user",
    name: "Trial User",
    email: "trial@trial.com",
  },
  expires: "2099-01-01T00:00:00.000Z",
};

export function Providers({ children }: { children: React.ReactNode }) {
  const bootstrapSession = offlineDemo || skipAuth ? trialSession : undefined;

  return (
    <SessionProvider session={bootstrapSession}>
      <ThemeProvider>
        <OfflineDemoProvider>
          {!offlineDemo && <ServiceWorkerRegister />}
          <ToastHost />
          <CursorAura />
          {children}
          {!offlineDemo && <InstallPrompt />}
        </OfflineDemoProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
