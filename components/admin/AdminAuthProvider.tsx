"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { appPath } from "@/lib/paths";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider basePath={appPath("/api/auth")}>{children}</SessionProvider>;
}
