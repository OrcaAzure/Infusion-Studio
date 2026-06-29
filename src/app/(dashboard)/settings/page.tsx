"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Settings } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LoadingSpinner } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { isOfflineDemo } from "@/lib/offline-demo/api";
import { resetDemoState } from "@/lib/offline-demo/store";

type SettingsForm = {
  name: string;
  socialHandle: string;
};

export default function SettingsPage() {
  const toast = useToast((s) => s.show);
  const offline = isOfflineDemo();
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
      toast("Failed to save settings");
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
            {...register("socialHandle", { required: true })}
          />
          <p className="mt-1 text-xs text-stone-400">Shown as @handle on shared recipes</p>
        </div>
        <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
          Save settings
        </Button>
      </form>

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
