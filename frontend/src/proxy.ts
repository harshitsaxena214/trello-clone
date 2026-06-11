import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.headers.get("cookie") ?? "";

  const isJoin = pathname.startsWith("/join");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isOrg = pathname.startsWith("/org");
  const isRoot = pathname === "/";

  let user = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/is-authenticated`,
      {
        headers: { cookie },
      },
    );

    if (res.ok) {
      user = await res.json();
    }
  } catch {}

  const getOrgs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org`, {
        headers: { cookie },
      });

      if (!res.ok) return [];

      const data = await res.json();
      return data.organisations ?? [];
    } catch {
      return [];
    }
  };

  // Landing page
  if (isRoot && user) {
    const orgs = await getOrgs();

    return NextResponse.redirect(
      new URL(
        orgs.length > 0 ? `/org/${orgs[0].slug}` : "/onboarding",
        req.url,
      ),
    );
  }

  // Auth pages
  if (
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) &&
    user
  ) {
    const orgs = await getOrgs();

    return NextResponse.redirect(
      new URL(
        orgs.length > 0 ? `/org/${orgs[0].slug}` : "/onboarding",
        req.url,
      ),
    );
  }

  // Join route requires auth
  if (isJoin && !user) {
    const returnUrl = encodeURIComponent(pathname);

    return NextResponse.redirect(
      new URL(`/sign-in?returnUrl=${returnUrl}`, req.url),
    );
  }

  // Protected routes
  if ((isOrg || isOnboarding) && !user) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Onboarding page should only be accessible if user has no orgs
  if (isOnboarding && user) {
    const orgs = await getOrgs();

    if (orgs.length > 0) {
      return NextResponse.redirect(new URL(`/org/${orgs[0].slug}`, req.url));
    }
  }

  // Validate org access
  if (isOrg) {
    const match = pathname.match(/^\/org\/([^/]+)/);

    if (match) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/org/slug/${match[1]}`,
          {
            headers: { cookie },
          },
        );

        if (!res.ok) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};