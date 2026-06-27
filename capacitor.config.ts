import type { CapacitorConfig } from "@capacitor/cli";

const offlineBuild = process.env.OFFLINE_BUILD === "true";
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "studio.infusion.app",
  appName: "Infusion Studio",
  webDir: offlineBuild ? "out" : "public/capacitor-shell",
  server: offlineBuild
    ? { androidScheme: "https" }
    : serverUrl
      ? {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          androidScheme: serverUrl.startsWith("https") ? "https" : "http",
        }
      : undefined,
  android: {
    allowMixedContent: true,
    backgroundColor: "#fafaf9",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: false,
    },
  },
};

export default config;
