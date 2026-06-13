
// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: "sb-auth-token",   // custom short name
        sameSite: "lax",
        secure: false,           // false for localhost
        maxAge: 60 * 60 * 24 * 3,
      },
    }
  );
}













// import { createBrowserClient } from "@supabase/ssr";

// /**
//  * Browser-side Supabase client.
//  * @supabase/ssr automatically persists the session in cookies
//  * (accessible to Next.js middleware for server-side refresh).
//  */
// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }




