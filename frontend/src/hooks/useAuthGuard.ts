"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

type Options = {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireOrgs?: boolean;
  requireNoOrgs?: boolean;
  isRoot?: boolean;
};

export function useAuthGuard(options: Options = {}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { requireAuth, requireNoAuth, requireOrgs, requireNoOrgs, isRoot } =
      options;

    api
      .get("/auth/is-authenticated", { withCredentials: true })
      .then(async (res) => {
        if (!res.data.isAuthenticated) {
          if (requireAuth || requireOrgs) {
            router.replace(
              `/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`,
            );
            return;
          }
          // isRoot or requireNoAuth — unauthenticated user, just show the page
          setChecking(false);
          return;
        }

        // authenticated — fetch orgs only when needed
        if (isRoot || requireNoAuth || requireOrgs || requireNoOrgs) {
          const orgsRes = await api.get("/org", { withCredentials: true });
          const orgs = orgsRes.data.data ?? [];
          const hasOrgs = orgs.length > 0;

          if (isRoot) {
            // authenticated user on / → send to their org
            router.replace(hasOrgs ? `/org/${orgs[0].slug}` : "/onboarding");
            return;
          }

          if (requireNoAuth) {
            router.replace(hasOrgs ? `/org/${orgs[0].slug}` : "/onboarding");
            return;
          }

          if (requireNoOrgs && hasOrgs) {
            router.replace(`/org/${orgs[0].slug}`);
            return;
          }

          if (requireOrgs && !hasOrgs) {
            router.replace("/onboarding");
            return;
          }
        }

        setChecking(false);
      })
      .catch(() => {
        // not authenticated
        if (requireAuth || requireOrgs) {
          router.replace(
            `/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        // isRoot or requireNoAuth — unauthenticated user, just show the page
        setChecking(false);
      });
  }, []);

  return { checking };
}
