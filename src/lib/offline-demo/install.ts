/** Install offline fetch shim before any React effects / data fetching. */
import { installOfflineFetch } from "./api";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_OFFLINE_DEMO === "true") {
  installOfflineFetch();
}
