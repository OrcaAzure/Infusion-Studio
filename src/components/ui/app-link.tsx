"use client";

import NextLink from "next/link";
import { appPath } from "@/lib/app-path";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

/** Link that works in the offline APK (trailing-slash static export). */
export function AppLink({ href, ...props }: AppLinkProps) {
  const resolved =
    typeof href === "string"
      ? appPath(href)
      : typeof href === "object" && href.pathname
        ? { ...href, pathname: appPath(href.pathname) }
        : href;
  return <NextLink href={resolved} {...props} />;
}
