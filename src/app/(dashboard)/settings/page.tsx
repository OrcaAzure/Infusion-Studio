"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Settings, Download, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { usePreferencesStore } from "@/stores";
import { isOfflineApk } from "@/lib/offline-demo/api";
import { resetDemoState } from "@/lib/offline-demo/store";

type SettingsForm = {
  name: string;
  socialHandle: string;
};

export default function SettingsPage() {
  const toast = useToast((s) => s.show);
  const offline = isOfflineApk();
  const alchemyOnApk = usePreferencesStore((s) => s.alchemyOnApk);
  const setAlchemyOnApk = usePreferencesStore((s) => s.setAlchemyOnApk);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    defaultValues: { name: "", socialHandle: "" },
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p?.name || p?.socialHandle) {
          reset({ name: p.name ?? "", socialHandle: p.socialHandle ?? "" });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast((err as { error?: string }).error ?? "Failed to save settings");
      return;
    }
    const updated = await res.json();
    reset({ name: updated.name ?? data.name, socialHandle: updated.socialHandle ?? data.socialHandle });
    toast("Settings saved");
  };

  const handleResetDemo = () => {
    resetDemoState();
    setShowResetModal(false);
    toast("Demo data reset");
    window.location.reload();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <DashboardHeader
        label="Preferences"
        title="Settings"
        description="Profile and preferences"
        icon={Settings}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-4">
        <Input id="name" label="Display name" {...register("name", { required: true })} />
        <div>
          <Input
            id="socialHandle"
            label="Social handle"
            placeholder="oven_infusion"
            {...register("socialHandle")}
          />
          <p className="mt-1 text-xs text-stone-400">Shown as @handle on shared recipes</p>
        </div>
        <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
          Save settings
        </Button>
      </form>

      <div className="mx-auto mt-8 max-w-md space-y-4">
        <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
          <h2 className="mb-1 text-sm font-semibold text-stone-800 dark:text-stone-200">
            Data backup
          </h2>
          <p className="mb-3 text-sm text-stone-500">
            Download all ingredients, blends, recipes, and brew logs as JSON.
          </p>
          <a
            href="/api/export"
            className="alchemy-btn-primary inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Export backup
          </a>
        </div>

        {offline && (
          <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
              <Sparkles className="h-4 w-4" />
              Alchemy theme
            </h2>
            <p className="mb-3 text-sm text-stone-500">
              Enable the green & gold laboratory look on the offline app.
            </p>
            <Button
              variant={alchemyOnApk ? "default" : "outline"}
              onClick={() => {
                setAlchemyOnApk(!alchemyOnApk);
                toast(alchemyOnApk ? "Alchemy theme off" : "Alchemy theme on");
              }}
            >
              {alchemyOnApk ? "Alchemy theme enabled" : "Enable alchemy theme"}
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
        <h2 className="mb-1 text-sm font-semibold text-stone-800 dark:text-stone-200">
          App tour
        </h2>
        <p className="mb-3 text-sm text-stone-500">
          Replay the walkthrough for pantry, blends, and timer.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            const { clearOnboardingFlag, ONBOARDING_REPLAY_EVENT } = await import(
              "@/components/providers/onboarding-tour"
            );
            await clearOnboardingFlag();
            window.dispatchEvent(new Event(ONBOARDING_REPLAY_EVENT));
            toast("App tour started");
          }}
        >
          Replay app tour
        </Button>
        </div>
      </div>

      {offline && (
        <div className="mx-auto mt-12 max-w-md rounded-xl border border-red-200 p-4 dark:border-red-900">
          <h2 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">Danger zone</h2>
          <p className="mb-3 text-sm text-stone-500">
            Reset all demo data to the original seed state. This cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => setShowResetModal(true)}>
            Reset demo data
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={showResetModal}
        title="Reset demo data?"
        message="All your ingredients, blends, recipes, and brew logs will be cleared."
        confirmLabel="Reset"
        variant="danger"
        onCancel={() => setShowResetModal(false)}
        onConfirm={handleResetDemo}
      />
    </div>
  );
}
