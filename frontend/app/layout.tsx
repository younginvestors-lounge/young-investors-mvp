import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AppSettingsProvider } from "@/lib/appSettings";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Young Investors",
  title: "Young Investors | We Cook",
  description:
    "Educational paper-trading simulation. Learn before you earn. No real money.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Young Investors",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/yi-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/yi-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/yi-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-pattern="off" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme + pattern before paint so there's no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var saved=localStorage.getItem('yi_theme');var t=(saved==='dark'||saved==='light')?saved:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);var p=localStorage.getItem('yi_pattern');document.documentElement.setAttribute('data-pattern',p==='on'?'on':'off');}catch(e){}})();",
          }}
        />
      </head>
      <body
        className={`${bodoni.variable} ${archivo.variable} ${spaceMono.variable}`}
      >
        <AppSettingsProvider>
          <AuthProvider>{children}</AuthProvider>
          <ServiceWorkerRegistrar />
        </AppSettingsProvider>
      </body>
    </html>
  );
}
