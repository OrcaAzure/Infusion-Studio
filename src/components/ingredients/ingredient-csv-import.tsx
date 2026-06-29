"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ingredientCategories } from "@/lib/validations/ingredient";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { IngredientCategory } from "@prisma/client";

type ImportRow = {
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
};

interface IngredientCsvImportProps {
  onImported: () => void;
}

function normalizeCategory(raw: string): IngredientCategory {
  const upper = raw.trim().toUpperCase();
  if ((ingredientCategories as readonly string[]).includes(upper)) {
    return upper as IngredientCategory;
  }
  const match = Object.entries(CATEGORY_LABELS).find(
    ([, label]) => label.toLowerCase() === raw.trim().toLowerCase()
  );
  return (match?.[0] as IngredientCategory) ?? "OTHER";
}

function mapRow(row: Record<string, string>): ImportRow | null {
  const keys = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
  );
  const name = keys.name?.trim();
  if (!name) return null;

  return {
    name,
    category: normalizeCategory(keys.category ?? "OTHER"),
    quantity: parseFloat(keys.quantity ?? "0") || 0,
    unit: keys.unit?.trim() || "g",
    pricePerUnit: keys.priceperunit
      ? parseFloat(keys.priceperunit) || undefined
      : keys.price
        ? parseFloat(keys.price) || undefined
        : undefined,
  };
}

export function IngredientCsvImport({ onImported }: IngredientCsvImportProps) {
  const toast = useToast((s) => s.show);
  const [preview, setPreview] = useState<ImportRow[] | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map(mapRow).filter((r): r is ImportRow => r !== null);
        if (rows.length === 0) {
          toast("No valid rows found in CSV");
          return;
        }
        setPreview(rows);
      },
      error: () => toast("Could not parse CSV file"),
    });
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    setImporting(true);
    const res = await fetch("/api/ingredients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: preview }),
    });
    setImporting(false);

    if (res.ok) {
      const data = await res.json();
      toast(`Imported ${data.imported} ingredients`);
      setPreview(null);
      onImported();
    } else {
      toast("Import failed");
    }
  };

  return (
    <>
      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 bg-transparent px-4 py-2 text-sm font-medium transition-all hover:bg-stone-50 dark:border-stone-600 dark:hover:bg-stone-800">
        <Upload className="h-4 w-4" />
        Import CSV
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>

      <Modal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title="Preview import"
        className="max-w-2xl"
      >
        {preview && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              {preview.length} ingredient{preview.length !== 1 ? "s" : ""} ready to import
            </p>
            <div className="max-h-64 overflow-auto rounded-lg border border-stone-200 dark:border-stone-700">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium">Category</th>
                    <th className="p-2 font-medium">Qty</th>
                    <th className="p-2 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-stone-100 dark:border-stone-800">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{CATEGORY_LABELS[row.category]}</td>
                      <td className="p-2">
                        {row.quantity} {row.unit}
                      </td>
                      <td className="p-2">{row.pricePerUnit ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreview(null)}>
                Cancel
              </Button>
              <Button onClick={handleImport} isLoading={importing}>
                Import {preview.length} items
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
