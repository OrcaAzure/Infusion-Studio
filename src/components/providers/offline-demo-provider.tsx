"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOfflineApk } from "@/lib/offline-demo/api";
import { initDemoState } from "@/lib/offline-demo/store";
import { appPath } from "@/lib/app-path";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { scheduleWeeklySummary } from "@/lib/weekly-summary";

const AndroidBackButton = dynamic(
  () =>
    import("@/components/native/android-back-button").then((m) => ({
      default: m.AndroidBackButton,
    })),
  { ssr: false }
);

const AUTH_PATHS = new Set(["/login", "/register"]);

function normalizePath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path;
}

export function OfflineDemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(!isOfflineApk());
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (!isOfflineApk()) return;
    void initDemoState().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) =>
        scheduleWeeklySummary(data.totalBrewsThisWeek ?? 0, data.totalBlends ?? 0)
      )
      .catch(() => {});
  }, [ready]);

  useLayoutEffect(() => {
    if (!isOfflineApk()) return;
    const path = normalizePath(pathname);
    if (AUTH_PATHS.has(path)) {
      router.replace(appPath("/"));
    }
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (!isOfflineApk() || !ready) return;
    const path = normalizePath(pathname);
    if (path === "/") return;
    setBannerVisible(true);
    const hide = setTimeout(() => setBannerVisible(false), 4000);
    return () => clearTimeout(hide);
  }, [pathname, ready]);

  if (!isOfflineApk()) return children;

  return (
    <>
      <AndroidBackButton />
      <div>{children}</div>
      {!ready && (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-stone-950/70">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-white/70">Loading Infusion Studio…</p>
        </div>
      )}
      <div
        className={`pointer-events-none fixed left-1/2 z-[100] -translate-x-1/2 rounded-full bg-emerald-600/90 px-3 py-1.5 text-center text-[11px] font-medium text-white shadow-lg backdrop-blur-sm transition-opacity duration-500 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-3 ${
          bannerVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        Offline demo — no internet needed
      </div>
    </>
  );
}
