import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_MAX_DAYS  = 3;
const SESSION_MAX_MS    = SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
const SESSION_TS_COOKIE = "id_session_ts";

export async function middleware(request: NextRequest) {
  // Step 1 — start with a plain passthrough response
  let supabaseResponse = NextResponse.next({ request });

  // Step 2 — build Supabase client wired to request/response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          
  cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Record<string, any>;
  }>



        ) {
          // First: write into the request so getUser() sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Then: recreate the response with the updated request
          supabaseResponse = NextResponse.next({ request });
          // Finally: write into the response so the browser gets them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Step 3 — ALWAYS call getUser() to refresh the session cookie
  // Do NOT use getSession() here — it won't refresh
  const { data: { user } } = await supabase.auth.getUser();

  const path      = request.nextUrl.pathname;
  const isLogin   = path === "/login" || path.startsWith("/login");
  const isPublic  = path === "/";

  // Step 4 — 3-day custom session expiry
  if (user) {
    const tsCookie = request.cookies.get(SESSION_TS_COOKIE)?.value;
    const now       = Date.now();

    if (!tsCookie) {
      supabaseResponse.cookies.set(SESSION_TS_COOKIE, String(now), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_MAX_DAYS * 24 * 60 * 60,
        path: "/",
      });
    } else {
      const elapsed = now - parseInt(tsCookie, 10);
      if (elapsed > SESSION_MAX_MS) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("expired", "1");
        const res = NextResponse.redirect(url);
        res.cookies.delete(SESSION_TS_COOKIE);
        return res;
      }
    }
  }

  // Step 5 — routing rules
  const isExpired = request.nextUrl.searchParams.get("expired") === "1";

  // Logged-in user on /login (and NOT an expired redirect) → dashboard
  if (user && isLogin && !isExpired) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("expired");
    return NextResponse.redirect(url);
  }

  // Unauthenticated user trying to reach a protected page → login
  if (!user && !isLogin && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Step 6 — return the response WITH all Supabase cookies attached
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};





// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// /**
//  * Middleware runs on every request.
//  * 1. Refreshes the Supabase session cookie if it has expired (keeps user logged in).
//  * 2. Enforces a 3-day session lifetime via a custom `id_session_ts` cookie.
//  * 3. Redirects unauthenticated requests to /login.
//  */

// const SESSION_MAX_DAYS = 3;
// const SESSION_MAX_MS   = SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
// const SESSION_TS_COOKIE = "id_session_ts";

// const PUBLIC_PATHS = ["/", "/login"];

// export async function middleware(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request });

//   // ── Build Supabase client that reads/writes cookies ──────────────────────
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },

//         setAll(
//   cookiesToSet: Array<{
//     name: string;
//     value: string;
//     options?: Record<string, any>;
//   }>
// ) {
//   cookiesToSet.forEach(({ name, value }) =>
//     request.cookies.set(name, value)
//   );

//   supabaseResponse = NextResponse.next({
//     request,
//   });

//   cookiesToSet.forEach(({ name, value, options }) =>
//     supabaseResponse.cookies.set(name, value, options)
//   );
// },



//       },
//     }
//   );

//   // ── Refresh session (IMPORTANT — do not remove) ──────────────────────────
//   const { data: { user } } = await supabase.auth.getUser();

//   const path = request.nextUrl.pathname;
//   const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith("/login"));

//   // ── 3-day session expiry logic ───────────────────────────────────────────
//   if (user) {
//     const tsCookie = request.cookies.get(SESSION_TS_COOKIE)?.value;
//     const now = Date.now();

//     if (!tsCookie) {
//       // First login — stamp the session start time
//       supabaseResponse.cookies.set(SESSION_TS_COOKIE, String(now), {
//         httpOnly: true,
//         sameSite: "lax",
//         secure: process.env.NODE_ENV === "production",
//         maxAge: SESSION_MAX_DAYS * 24 * 60 * 60,   // 3 days in seconds
//         path: "/",
//       });
//     } else {
//       const elapsed = now - parseInt(tsCookie, 10);
//       if (elapsed > SESSION_MAX_MS) {
//         // 3 days exceeded — sign out + redirect to login
//         await supabase.auth.signOut();
//         supabaseResponse.cookies.delete(SESSION_TS_COOKIE);
//         const redirectUrl = request.nextUrl.clone();
//         redirectUrl.pathname = "/login";
//         redirectUrl.searchParams.set("expired", "1");
//         return NextResponse.redirect(redirectUrl);
//       }
//     }
//   }

//   // ── Protect /dashboard ───────────────────────────────────────────────────
//   if (!user && !isPublic) {
//     const redirectUrl = request.nextUrl.clone();
//     redirectUrl.pathname = "/login";
//     return NextResponse.redirect(redirectUrl);
//   }

//   // ── Redirect already-logged-in users away from /login ───────────────────
//   // if (user && path === "/login") {
//   //   const redirectUrl = request.nextUrl.clone();
//   //   redirectUrl.pathname = "/dashboard";
//   //   return NextResponse.redirect(redirectUrl);
//   // }


// // ── Redirect already-logged-in users away from /login ───────────────────
// // Exception: allow through if ?expired=1 (session was just force-signed-out)
// const isExpiredParam = request.nextUrl.searchParams.get("expired") === "1";
// if (user && path === "/login" && !isExpiredParam) {
//   const redirectUrl = request.nextUrl.clone();
//   redirectUrl.pathname = "/dashboard";
//   return NextResponse.redirect(redirectUrl);
// }

//   return supabaseResponse;
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization)
//      * - favicon.ico, sitemap.xml, robots.txt
//      * - public files with extensions
//      */
//     "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
//   ],
// };
