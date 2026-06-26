import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50 p-4 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl dark:border-stone-700 dark:bg-stone-900">
        <LoginForm />
      </div>
    </div>
  );
}
