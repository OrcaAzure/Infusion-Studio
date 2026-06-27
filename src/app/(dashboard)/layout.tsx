import { Sidebar } from "@/components/layout/sidebar";
import { SceneBackground } from "@/components/ui/scene-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50/90 dark:bg-stone-950/90">
      <SceneBackground />
      <Sidebar />
      <main className="relative z-10 lg:pl-64">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
