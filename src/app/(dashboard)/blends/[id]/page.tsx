"use client";

import { useParams } from "next/navigation";
import { BlendDetailView } from "@/components/blends/blend-detail-view";

export default function BlendDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <BlendDetailView id={id} />;
}
