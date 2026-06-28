import { Sidebar } from "@/components/layout/sidebar";
import { SceneBackground } from "@/components/ui/scene-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-50/90 dark:bg-stone-950/90">
      <SceneBackground />
      <Sidebar />
      <main className="relative z-10 overflow-x-hidden lg:pl-64">
        <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
