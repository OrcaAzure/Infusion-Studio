import { Sidebar } from "@/components/layout/sidebar";
import { SceneBackground } from "@/components/ui/scene-background";
import { PageTransition } from "@/components/ui/motion";
import { OnboardingTour } from "@/components/providers/onboarding-tour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="alchemy-shell relative min-h-screen overflow-x-hidden">
      <SceneBackground />
      <Sidebar />
      <main className="relative z-10 overflow-x-hidden lg:pl-64">
        <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8" style={{ minHeight: "100dvh" }}>
          <PageTransition>{children}</PageTransition>
          <OnboardingTour />
        </div>
      </main>
    </div>
  );
}
