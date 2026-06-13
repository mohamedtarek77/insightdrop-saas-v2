import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_MAX_DAYS = 3;
const SESSION_MAX_MS = SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
const SESSION_TS_COOKIE = "id_session_ts";

const PUBLIC_PATHS = ["/", "/login"];

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, any>;
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        // setAll(cookiesToSet: CookieToSet[]) {
        //   cookiesToSet.forEach(({ name, value }) => {
        //     request.cookies.set(name, value);
        //   });

        //   supabaseResponse = NextResponse.next({
        //     request,
        //   });

        //   cookiesToSet.forEach(({ name, value, options }) => {
        //     supabaseResponse.cookies.set(name, value, options);
        //   });
        // },

// setAll(
//   cookiesToSet: Array<{
//     name: string;
//     value: string;
//     options?: Record<string, any>;
//   }>
// ) {
//   cookiesToSet.forEach(({ name, value, options }) => {
//     request.cookies.set(name, value);

//     supabaseResponse.cookies.set(name, value, options);
//   });
// }




setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, any> }>) {
  cookiesToSet.forEach(({ name, value }) =>
    request.cookies.set(name, value)
  );

  supabaseResponse = NextResponse.next({ request }); // ← recreate with updated request

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

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith("/login")
  );

  if (user) {
    const tsCookie = request.cookies.get(SESSION_TS_COOKIE)?.value;
    const now = Date.now();

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

        supabaseResponse.cookies.delete(SESSION_TS_COOKIE);

        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        redirectUrl.searchParams.set("expired", "1");

        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";

    return NextResponse.redirect(redirectUrl);
  }

  if (user && path === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";

    return NextResponse.redirect(redirectUrl);
  }    

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// /**
//  * Server-side Supabase client — reads/writes cookies for session persistence.
//  * Use this in Server Components, Route Handlers, and middleware.
//  */
// export async function createServerSupabaseClient() {
//   const cookieStore = await cookies();

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll();
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) : any =>
//               cookieStore.set(name, value, options)
//             );
//           } catch {
//             // Called from a Server Component — middleware handles refresh
//           }
//         },
//       },
//     }
//   );
// }
