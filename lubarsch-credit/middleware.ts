import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n-config";

/**
 * Clean URLs (/loans) are rewritten internally to /<locale>/loans so every page can be
 * statically generated per language. The language comes from the cookie set by the
 * language switcher (or from an explicit /yo/... link, which also sets the cookie).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== first) {
      res.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }

  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookie) ? cookie : defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API, admin, Next internals and any file with an extension (images, sw.js, manifest, offline.html…)
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
