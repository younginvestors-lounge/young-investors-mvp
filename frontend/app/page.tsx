import { redirect } from "next/navigation";
import { publicVeilEnabled } from "@/lib/publicVeil";

// The public front door. Auth/onboarding redirects are handled client-side by
// /login because this server route cannot see the Supabase browser session.
export const dynamic = "force-dynamic";

export default function RootPage() {
  if (publicVeilEnabled()) {
    return (
      <main
        style={{
          minHeight: "100svh",
          background: "var(--yi-paper)",
          color: "var(--yi-ink)",
          display: "grid",
          placeItems: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <section style={{ display: "grid", gap: 16, maxWidth: 760 }}>
          <p
            style={{
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "clamp(1.8rem,8vw,4.8rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: 0,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            CURRENTLY STILL COOKING, WE WILL SERVE YOU LATER
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              margin: 0,
              textTransform: "uppercase",
              color: "var(--yi-muted)",
            }}
          >
            Young Investors · We Cook
          </p>
        </section>
      </main>
    );
  }

  redirect("/join");
}
