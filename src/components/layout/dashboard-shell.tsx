"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { LabTopBar } from "@/components/layout/lab-top-bar";
import { LabMobileNav } from "@/components/layout/lab-mobile-nav";
import { FluidCanvas, FluidStage } from "@/components/layout/fluid-stage";
import { SceneBackground } from "@/components/ui/scene-background";
import { PageTransition } from "@/components/ui/motion";
import { OnboardingTour } from "@/components/providers/onboarding-tour";

/** Shared web + APK shell — fluid lab frame, top bar, mobile dock. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="alchemy-shell relative min-h-screen overflow-x-hidden">
      <SceneBackground />
      <FluidCanvas className="relative">
        <Sidebar />
        <main className="relative z-10 overflow-x-hidden lg:pl-[calc(16rem+1.25rem)] xl:pl-[calc(16rem+2.5rem)]">
          <FluidStage>
            <LabTopBar />
            <div className="mx-auto w-full max-w-7xl">
              <PageTransition>{children}</PageTransition>
            </div>
            <div className="lab-mobile-nav-spacer" aria-hidden />
            <OnboardingTour />
          </FluidStage>
        </main>
        <LabMobileNav />
      </FluidCanvas>
    </div>
  );
}
