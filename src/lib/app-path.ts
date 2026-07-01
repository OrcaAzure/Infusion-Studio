/** Next static export (offline APK) uses trailingSlash — keep client navigations consistent. */
export function appPath(path: string) {
  if (process.env.NEXT_PUBLIC_OFFLINE_DEMO !== "true") return path;
  if (path === "/") return path;

  const qIndex = path.indexOf("?");
  const pathname = qIndex === -1 ? path : path.slice(0, qIndex);
  const search = qIndex === -1 ? "" : path.slice(qIndex + 1);

  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return search ? `${normalized}?${search}` : normalized;
}
