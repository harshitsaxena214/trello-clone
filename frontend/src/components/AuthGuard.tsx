"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard({ requireAuth: true, requireOrgs: true });
  if (checking) return null;
  return <>{children}</>;
}
