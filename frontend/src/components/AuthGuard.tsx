"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard({ requireAuth: true, requireOrgs: true });

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
