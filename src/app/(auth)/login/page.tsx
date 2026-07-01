import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="alchemy-shell relative flex min-h-screen items-center justify-center p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(64,145,108,0.18),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(201,162,39,0.08),transparent)]"
        aria-hidden
      />
      <div className="alchemy-card ui-lift relative w-full max-w-md rounded-2xl p-8">
        <LoginForm />
      </div>
    </div>
  );
}
