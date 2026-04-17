import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const { ok, url, anonKey } = getSupabasePublicEnv();

  if (!ok) {
    if (path.startsWith("/admin") || path.startsWith("/matrix")) {
      const u = request.nextUrl.clone();
      u.pathname = "/";
      u.searchParams.set("missing_env", "1");
      return NextResponse.redirect(u);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((path.startsWith("/admin") || path.startsWith("/matrix")) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/matrix/:path*"],
};
