"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { isOfflineDemo } from "@/lib/offline-demo/api";

const SIGNUP_URL = process.env.NEXT_PUBLIC_SIGNUP_URL ?? "https://infusion-studio.app/register";

interface SignupCtaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupCtaModal({ isOpen, onClose }: SignupCtaModalProps) {
  if (!isOfflineDemo()) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save your blends forever">
      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        Create a free account to save your blends permanently, sync across devices, and share
        recipes with the community.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Keep exploring
        </Button>
        <Button
          onClick={() => {
            window.open(SIGNUP_URL, "_blank", "noopener,noreferrer");
            onClose();
          }}
        >
          Sign up free
        </Button>
      </div>
    </Modal>
  );
}
