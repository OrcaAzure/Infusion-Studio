import type { NextConfig } from "next";
import path from "path";

const isOfflineBuild = process.env.OFFLINE_BUILD === "true";
const capacitorAppStub = "./src/lib/stubs/capacitor-app.ts";
const capacitorAppStubAbs = path.join(__dirname, "src/lib/stubs/capacitor-app.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SKIP_AUTH: process.env.SKIP_AUTH,
  },
  turbopack: {
    resolveAlias: isOfflineBuild
      ? {}
      : {
          "@capacitor/app": capacitorAppStub,
        },
  },
  webpack: (config) => {
    if (!isOfflineBuild) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@capacitor/app": capacitorAppStubAbs,
      };
    }
    return config;
  },
  ...(isOfflineBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/sw.js",
              headers: [
                { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
                { key: "Service-Worker-Allowed", value: "/" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
