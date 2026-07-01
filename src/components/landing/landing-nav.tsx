"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNav({ className }: { className?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10",
        className
      )}
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
    >
      <Link href="/" className="flex items-center gap-2.5 text-white">
        <Image
          src="/icons/icon-192.png"
          width={36}
          height={36}
          alt=""
          className="rounded-lg shadow-md shadow-black/30"
        />
        <span className="text-sm font-semibold tracking-tight sm:text-base">Infusion Studio</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link href="/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button
            size="sm"
            className="border-0 bg-white text-stone-900 shadow-lg hover:bg-white/90"
          >
            Get started
          </Button>
        </Link>
      </nav>
    </motion.header>
  );
}
