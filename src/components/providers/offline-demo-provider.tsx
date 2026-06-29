"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import { initDemoState } from "@/lib/offline-demo/store";
import { appPath } from "@/lib/app-path";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { OnboardingTour } from "./onboarding-tour";

const DEMO_PATHS = new Set(["/", "/login", "/register"]);

function normalizePath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path;
}

export function OfflineDemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(!isOfflineDemo());
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (!isOfflineDemo()) return;
    void initDemoState().then(() => setReady(true));
  }, []);

  useLayoutEffect(() => {
    if (!isOfflineDemo() || !ready) return;
    const path = normalizePath(pathname);
    if (DEMO_PATHS.has(path)) {
      router.replace(appPath("/dashboard"));
    }
  }, [pathname, router, ready]);

  useLayoutEffect(() => {
    if (!isOfflineDemo() || !ready) return;
    setBannerVisible(true);
    const hide = setTimeout(() => setBannerVisible(false), 4000);
    return () => clearTimeout(hide);
  }, [pathname, ready]);

  if (!isOfflineDemo()) return children;

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">{children}</div>
      <OnboardingTour />
      <div
        className={`pointer-events-none fixed left-1/2 z-[100] -translate-x-1/2 rounded-full bg-emerald-600/90 px-3 py-1.5 text-center text-[11px] font-medium text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 ${
          bannerVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        Offline demo — no internet needed
      </div>
    </>
  );
}
