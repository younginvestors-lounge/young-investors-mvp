import { redirect } from "next/navigation";

// The public front door: anyone landing on younginvestors.co.za gets the
// "Join The Syndicate" splash (install / enter on web). Installed PWA users
// open straight to the app via the manifest start_url (/login), not here.
export default function RootPage() {
  redirect("/join");
}
