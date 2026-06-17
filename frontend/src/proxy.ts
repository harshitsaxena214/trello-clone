import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (!req.auth && !isPublicRoute) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("returnUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (req.auth && isPublicRoute) {
    return NextResponse.redirect(new URL("/org", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|preview\\.png).*)"],
};
