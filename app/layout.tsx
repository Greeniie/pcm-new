import type { Metadata } from "next";
import "@/app/globals.css";
import PublicShell from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Pentecostal Canaanland Mission | PCM",
  description:
    "Raising multi-cultural people with the extraordinary grace of prosperity of the spirit, soul and body and for the expansion of God's Kingdom.",
  keywords: "church, Lagos, Pentecostal, Canaanland, Ajao Estate, PCM, Pastor Nick",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark text-white">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}