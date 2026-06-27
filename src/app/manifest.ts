import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infusion Studio",
    short_name: "Infusion",
    description:
      "Craft, blend, and brew artisan infusions. Manage ingredients, create blends, and share recipes.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#059669",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["food", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
        label: "Infusion Studio",
      },
    ],
  };
}
