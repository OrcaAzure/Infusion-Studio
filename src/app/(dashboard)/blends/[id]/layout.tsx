import { DEMO_BLEND_IDS } from "@/lib/offline-demo/static-params";

export function generateStaticParams() {
  if (process.env.OFFLINE_BUILD === "true") {
    return DEMO_BLEND_IDS.map((id) => ({ id }));
  }
  return [];
}

export default function BlendIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
