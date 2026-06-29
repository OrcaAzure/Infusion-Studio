"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BlendDetailView } from "@/components/blends/blend-detail-view";
import { LoadingSpinner } from "@/components/ui/empty-state";

function BlendItemContent() {
  const id = useSearchParams().get("id");
  if (!id) return <p>Blend not found</p>;
  return <BlendDetailView id={id} />;
}

export default function BlendItemPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlendItemContent />
    </Suspense>
  );
}
