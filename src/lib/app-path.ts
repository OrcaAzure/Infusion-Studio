/** Next static export (offline APK) uses trailingSlash — keep client navigations consistent. */
export function appPath(path: string) {
  if (process.env.NEXT_PUBLIC_OFFLINE_DEMO !== "true") return path;
  if (path === "/") return path;
  return path.endsWith("/") ? path : `${path}/`;
}
