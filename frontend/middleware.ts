import { NextResponse, type NextRequest } from "next/server";
import { publicVeilEnabled } from "@/lib/publicVeil";

const PUBLIC_FILE = /\.[^/]+$/;

function canPassVeil(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/audio/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/sw.js" ||
    pathname === "/googlebe5dff13e08623d8.html" ||
    PUBLIC_FILE.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  if (!publicVeilEnabled()) return NextResponse.next();
  if (canPassVeil(request.nextUrl.pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api/).*)"],
};
