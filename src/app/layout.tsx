import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Xeltrix Sparkle",
  description: "Every room, guest-ready",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d9488",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <I18nProvider initialLang={session?.lang ?? "en"}>{children}</I18nProvider>
      </body>
    </html>
  );
}
