"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

const NAV: Record<string, { href: string; key: string; icon: string }[]> = {
  cleaner: [
    { href: "/rooms", key: "navRooms", icon: "🛏️" },
    { href: "/issues", key: "navIssues", icon: "🔧" },
    { href: "/checkin", key: "navCheckin", icon: "🕒" },
  ],
  supervisor: [
    { href: "/inspect", key: "navInspect", icon: "✅" },
    { href: "/issues", key: "navIssues", icon: "🔧" },
    { href: "/checkin", key: "navCheckin", icon: "🕒" },
  ],
  owner: [
    { href: "/dashboard", key: "navDashboard", icon: "📊" },
    { href: "/inspect", key: "navInspect", icon: "✅" },
    { href: "/issues", key: "navIssues", icon: "🔧" },
    { href: "/checkin", key: "navCheckin", icon: "🕒" },
  ],
};

export default function BottomNav({ role }: { role: string }) {
  const path = usePathname();
  const { t } = useI18n();
  const items = NAV[role] ?? NAV.cleaner;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-md justify-around border-t border-slate-200 bg-white/95 backdrop-blur">
      {items.map((it) => {
        const active = path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-teal-600" : "text-slate-500"
            }`}
          >
            <span className="text-xl">{it.icon}</span>
            <span className="font-medium">{t(it.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
