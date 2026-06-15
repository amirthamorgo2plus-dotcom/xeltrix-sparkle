import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getSession } from "@/lib/session";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Xeltrix Sparkle",
  description: "Every room, guest-ready",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sparkle", statusBarStyle: "default" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ea580c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-stone-50 text-stone-900">
        <PWARegister />
        <I18nProvider initialLang={session?.lang ?? "en"}>{children}</I18nProvider>
      </body>
    </html>
  );
}
