"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
  { value: "system" as const, icon: Monitor, label: "System" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800", className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "h-8 px-2",
            theme === value && "bg-white shadow-sm dark:bg-stone-700"
          )}
          aria-label={`${label} theme`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
