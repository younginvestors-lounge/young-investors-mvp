import { redirect } from "next/navigation";

// The public front door. Auth/onboarding redirects are handled client-side by
// /login because this server route cannot see the Supabase browser session.
export default function RootPage() {
  redirect("/join");
}
