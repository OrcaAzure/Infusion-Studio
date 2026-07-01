"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Pencil, Check, X } from "lucide-react";
import { isToday, isYesterday, format } from "date-fns";
import { DashboardHeader } from "@/components/layout/sidebar";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, EmptyState } from "@/components/ui/empty-state";
import { blendPath } from "@/lib/entity-path";
import type { BrewLogEntry } from "@/types";

function groupByDate(logs: BrewLogEntry[]) {
  const map = new Map<string, BrewLogEntry[]>();
  logs.forEach((log) => {
    const d = new Date(log.brewedAt);
    const key = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "dd MMM yyyy");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  });
  return map;
}

export default function BrewLogsPage() {
  const [logs, setLogs] = useState<BrewLogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const fetchLogs = useCallback(async (nextCursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const url = nextCursor ? `/api/brew-logs?cursor=${nextCursor}` : "/api/brew-logs";
    const res = await fetch(url);
    const data = await res.json();

    if (Array.isArray(data)) {
      setLogs(data);
      setHasMore(false);
    } else {
      const page = (data.logs ?? []) as BrewLogEntry[];
      setLogs((prev) => (append ? [...prev, ...page] : page));
      setHasMore(!!data.nextCursor);
      setCursor(data.nextCursor ?? null);
    }

    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const saveNotes = async (id: string) => {
    await fetch(`/api/brew-logs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: editNotes }),
    });
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, notes: editNotes } : l)));
    setEditingId(null);
  };

  const grouped = groupByDate(logs);

  return (
    <div>
      <DashboardHeader title="Brew History" description="Your logged infusion sessions" />

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="No brews yet"
          description="Start a brew timer to log your sessions"
        />
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([dateLabel, items]) => (
            <section key={dateLabel}>
              <h3 className="sticky top-0 z-10 mb-3 bg-stone-50/95 py-1 text-sm font-semibold text-stone-500 backdrop-blur-sm dark:bg-stone-950/95">
                {dateLabel}
              </h3>
              <ul className="space-y-3">
                {items.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900/80"
                  >
                    <p className="text-sm text-stone-500">
                      {format(new Date(log.brewedAt), "HH:mm")}
                    </p>
                    {log.blend ? (
                      <AppLink
                        href={blendPath(log.blend.id)}
                        className="mt-1 block font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {log.blend.name}
                      </AppLink>
                    ) : (
                      <p className="mt-1 text-sm italic text-stone-400">Blend deleted</p>
                    )}
                    {log.recipe?.name && (
                      <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                        Recipe: {log.recipe.name}
                      </p>
                    )}
                    {editingId === log.id ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Brew notes..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(log.id)}>
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-start justify-between gap-2">
                        {log.notes ? (
                          <p className="text-sm text-stone-500 dark:text-stone-400">{log.notes}</p>
                        ) : (
                          <p className="text-sm italic text-stone-400">No notes</p>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 shrink-0 px-2"
                          onClick={() => {
                            setEditingId(log.id);
                            setEditNotes(log.notes ?? "");
                          }}
                          aria-label="Edit notes"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              isLoading={loadingMore}
              onClick={() => void fetchLogs(cursor, true)}
            >
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
