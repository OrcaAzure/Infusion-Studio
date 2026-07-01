"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { appPath } from "@/lib/app-path";
import { Droplets } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/motion";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      const msg = body.error?.email?.[0] ?? "Registration failed";
      setError(msg);
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Account created but sign-in failed. Please log in.");
      return;
    }

    router.push(appPath("/dashboard"));
    router.refresh();
  };

  return (
    <FadeIn>
      <div className="mb-8 text-center">
        <div className="alchemy-icon-badge mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white">
          <Droplets className="h-7 w-7" />
        </div>
        <p className="alchemy-label mb-2 text-xs font-medium uppercase tracking-widest">Join the lab</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Create account</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Start crafting your perfect infusions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Jane Brewer"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400 [.theme-alchemy_&]:text-[var(--alchemy-gold)] [.theme-alchemy_&]:hover:text-[var(--alchemy-brass)]">
          Sign in
        </Link>
      </p>
    </FadeIn>
  );
}
