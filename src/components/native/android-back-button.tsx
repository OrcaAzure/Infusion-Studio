"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appPath } from "@/lib/app-path";
import { isOfflineApk } from "@/lib/offline-demo/api";

/** Android hardware back: navigate in-app instead of exiting. */
export function AndroidBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (!isOfflineApk()) return;

    let remove: (() => void) | undefined;

    void import("@capacitor/app").then(({ App }) => {
      void App.addListener("backButton", () => {
        const path = window.location.pathname.replace(/\/$/, "") || "/";
        const atHome = path === "/" || path === "/dashboard";

        if (window.history.length > 1 && !atHome) {
          router.back();
        } else if (!atHome) {
          router.push(appPath("/"));
        } else {
          void App.minimizeApp();
        }
      }).then((handle) => {
        remove = () => void handle.remove();
      });
    });

    return () => remove?.();
  }, [router]);

  return null;
}
