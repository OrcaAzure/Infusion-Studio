"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/layout/sidebar";
import { AppLink } from "@/components/ui/app-link";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { blendPath } from "@/lib/entity-path";
import type { BrewLogEntry } from "@/types";

export default function BrewLogsPage() {
  const [logs, setLogs] = useState<BrewLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brew-logs")
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <DashboardHeader
        title="Brew History"
        description="Your logged infusion sessions"
      />

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="No brews yet"
          description="Start a brew timer to log your sessions"
        />
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900/80"
            >
              <p className="text-sm text-stone-500">
                {format(new Date(log.brewedAt), "dd MMM yyyy, HH:mm")}
              </p>
              {log.blend && (
                <AppLink
                  href={blendPath(log.blend.id)}
                  className="mt-1 block font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {log.blend.name}
                </AppLink>
              )}
              {log.recipe?.name && (
                <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                  Recipe: {log.recipe.name}
                </p>
              )}
              {log.notes && (
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{log.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
