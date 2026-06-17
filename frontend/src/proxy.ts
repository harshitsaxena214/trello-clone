import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!req.auth && !isPublicRoute) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (req.auth && isPublicRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
