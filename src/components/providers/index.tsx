"use client";

import "@/lib/offline-demo/install";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { CursorAura } from "@/components/ui/cursor-aura";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineDemoProvider } from "./offline-demo-provider";
import { AlchemyThemeBridge } from "./alchemy-theme-bridge";
import { ToastHost } from "@/components/ui/toast";

const offlineApk = process.env.NEXT_PUBLIC_OFFLINE_APK === "true";
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
  const bootstrapSession = offlineApk || skipAuth ? trialSession : undefined;

  return (
    <SessionProvider session={bootstrapSession}>
      <ThemeProvider>
        <OfflineDemoProvider>
          <AlchemyThemeBridge />
          {!offlineApk && <ServiceWorkerRegister />}
          <ToastHost />
          <CursorAura />
          {children}
          {!offlineApk && <InstallPrompt />}
        </OfflineDemoProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
