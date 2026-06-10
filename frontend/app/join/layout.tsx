import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Young Investors | We Cook.",
  description:
    "Young Investors is a governance-first wealth creation platform for young people. Form a Kitchen, propose recipes, vote together, build your Vault. Learn before you earn.",
  openGraph: {
    title: "Young Investors | We Cook.",
    description:
      "Form a Kitchen. Propose recipes. Vote together. Build your Vault. The first peer-governance investment education platform for young South Africans.",
    url: "https://younginvestors.co.za/join",
    siteName: "Young Investors",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Young Investors | We Cook.",
    description:
      "Governance-first wealth creation for young people. Form a Kitchen, vote on recipes, build your Vault.",
  },
  alternates: {
    canonical: "https://younginvestors.co.za/join",
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
