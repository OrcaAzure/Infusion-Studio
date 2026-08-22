/** Shared by the Node auth route and the Edge proxy so JWTs verify. */
export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.VERCEL ? "infusion-studio-vercel-auth-secret" : undefined)
  );
}
