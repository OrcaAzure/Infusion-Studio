import { DEMO_BLEND_IDS } from "@/lib/offline-demo/static-params";

export function generateStaticParams() {
  return DEMO_BLEND_IDS.map((id) => ({ id }));
}

export default function BlendIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
