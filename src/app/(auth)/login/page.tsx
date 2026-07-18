import { LoginForm } from "@/components/auth/login-form";
import { FluidCanvas, FluidStage } from "@/components/layout/fluid-stage";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <FluidCanvas className="alchemy-shell relative flex min-h-screen items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(64,145,108,0.18),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(201,162,39,0.08),transparent)]"
        aria-hidden
      />
      <FluidStage className="fluid-stage-compact relative w-full max-w-md">
        <LoginForm />
      </FluidStage>
    </FluidCanvas>
  );
}
