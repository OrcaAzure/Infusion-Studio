"use client";

import { Smartphone, Download, KeyRound, ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QAPage() {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div>
      <DashboardHeader
        title="QA Testing — Samsung"
        description="Install and test the mobile app build"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glowColor="#059669">
          <CardTitle className="mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            Install on Samsung
          </CardTitle>
          <ol className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
            <li>
              <strong className="text-stone-900 dark:text-stone-100">1.</strong> Open this page in{" "}
              <strong>Samsung Internet</strong> or <strong>Chrome</strong>
            </li>
            <li>
              <strong className="text-stone-900 dark:text-stone-100">2.</strong> Tap the menu (⋮) →{" "}
              <strong>Add to Home screen</strong> or <strong>Install app</strong>
            </li>
            <li>
              <strong className="text-stone-900 dark:text-stone-100">3.</strong> Confirm — the app icon
              appears on your home screen
            </li>
            <li>
              <strong className="text-stone-900 dark:text-stone-100">4.</strong> Open from home screen
              for full-screen app mode
            </li>
          </ol>
          <p className="mt-4 text-xs text-stone-400">
            You may also see an &quot;Install Infusion Studio&quot; banner at the bottom of the screen.
          </p>
        </Card>

        <Card glowColor="#a855f7">
          <CardTitle className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            Test Login
          </CardTitle>
          <div className="space-y-2 rounded-lg bg-stone-50 p-4 font-mono text-sm dark:bg-stone-800">
            <p>
              <span className="text-stone-500">Email:</span> trial@trial.com
            </p>
            <p>
              <span className="text-stone-500">Password:</span> trial123
            </p>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Or use <strong>Quick enter as trial user</strong> on the login page.
          </p>
        </Card>

        <Card className="lg:col-span-2" glowColor="#10b981">
          <CardTitle className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600" />
            What to Test
          </CardTitle>
          <div className="grid gap-2 sm:grid-cols-2 text-sm text-stone-600 dark:text-stone-400">
            {[
              "Dashboard loads with stats",
              "Ingredient list & detail pages",
              "Pairing recommendations",
              "Blend creator drag-and-drop",
              "Oven Infusion share feed",
              "Brew timer",
              "Dark mode toggle",
              "Install app / home screen icon",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {item}
              </div>
            ))}
          </div>
          {appUrl && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-emerald-600" />
              <span className="text-stone-500">App URL:</span>
              <code className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-800">
                {appUrl}
              </code>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
