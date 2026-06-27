"use client";

import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import { appPath } from "@/lib/app-path";

const DEMO_PATHS = new Set(["/", "/login", "/register"]);

function normalizePath(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path;
}

export function OfflineDemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!isOfflineDemo()) return;
    const path = normalizePath(pathname);
    if (DEMO_PATHS.has(path)) {
      router.replace(appPath("/dashboard"));
    }
  }, [pathname, router]);

  if (!isOfflineDemo()) return children;

  return (
    <>
      <div className="pointer-events-none fixed bottom-3 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-emerald-600/90 px-3 py-1 text-center text-[11px] font-medium text-white shadow-lg backdrop-blur-sm">
        Offline demo — no internet needed
      </div>
      {children}
    </>
  );
}
