"use client";

import { ClipboardList, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { DashboardStats } from "@/types";

export function LowStockShoppingList({
  items,
}: {
  items: DashboardStats["lowStockItems"];
}) {
  const toast = useToast((s) => s.show);

  if (!items.length) return null;

  const lines = items.map(
    (i) => `- ${i.name} (need restock: ${i.quantity} ${i.unit} left)`
  );
  const text = `Infusion Studio — shopping list\n${lines.join("\n")}`;

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Shopping list copied");
    } catch {
      toast("Could not copy list");
    }
  };

  const downloadList = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "infusion-shopping-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={copyList}>
        <ClipboardList className="h-3.5 w-3.5" />
        Copy shopping list
      </Button>
      <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={downloadList}>
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    </div>
  );
}
