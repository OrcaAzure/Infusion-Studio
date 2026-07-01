import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WelcomePage } from "@/components/landing/welcome-page";

export const dynamic = "force-static";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <WelcomePage />;
}
