import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 * Do NOT pass custom cookieOptions.name — it must match the default
 * `sb-<project-ref>-auth-token` that the server/middleware expect.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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




