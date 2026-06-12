


import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component
          }
        },
      },
    }
  );
}






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
