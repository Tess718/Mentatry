import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute =
    pathname.startsWith("/quizzes") ||
    pathname.startsWith("/daily") ||
    pathname.startsWith("/achievements") ||
    (pathname.startsWith("/rooms") && pathname !== "/rooms/join");

  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    const rawCallbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const redirectTo = (rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//"))
      ? rawCallbackUrl
      : "/quizzes";
    return Response.redirect(new URL(redirectTo, req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/quizzes/:path*",
    "/rooms/:path*",
    "/daily/:path*",
    "/achievements/:path*",
    "/login",
    "/signup",
  ],
};
