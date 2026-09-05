import { NextResponse, type NextRequest } from "next/server";

import {
  COOKIE,
  cookieOptions,
  decryptSession,
  encryptSession,
  IDLE_MS,
  needsRefresh,
} from "@/lib/auth/token";

const PROTECTED = ["/esims", "/purchases"];

export async function proxy(request: NextRequest) {
  const decoded = await decryptSession(request.cookies.get(COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (!decoded && PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const response = NextResponse.next();

  if (decoded && needsRefresh(decoded.tokenIssuedAt)) {
    response.cookies.set(COOKIE, await encryptSession(decoded.session), {
      ...cookieOptions,
      expires: new Date(Date.now() + IDLE_MS),
    });
  }

  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|videos|buttons).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
