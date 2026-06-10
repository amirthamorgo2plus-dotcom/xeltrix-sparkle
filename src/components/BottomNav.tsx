"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

const NAV: Record<string, { href: string; key: string; icon: string }[]> = {
  cleaner: [
    { href: "/rooms", key: "navRooms", icon: "rooms" },
    { href: "/issues", key: "navIssues", icon: "issues" },
    { href: "/checkin", key: "navCheckin", icon: "checkin" },
  ],
  supervisor: [
    { href: "/inspect", key: "navInspect", icon: "inspect" },
    { href: "/issues", key: "navIssues", icon: "issues" },
    { href: "/checkin", key: "navCheckin", icon: "checkin" },
  ],
  owner: [
    { href: "/dashboard", key: "navDashboard", icon: "dashboard" },
    { href: "/inspect", key: "navInspect", icon: "inspect" },
    { href: "/issues", key: "navIssues", icon: "issues" },
    { href: "/checkin", key: "navCheckin", icon: "checkin" },
  ],
};

// Stroke line-icons (24x24). Inherit color via currentColor.
const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  rooms: (
    <>
      <path d="M3 11h18" />
      <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M3 11v7" />
      <path d="M21 11v7" />
      <path d="M3 18h18" />
    </>
  ),
  inspect: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6" />
      <path d="m9 13 1.8 1.8L14 11.5" />
    </>
  ),
  issues: (
    <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.6-.5-.5-2.6 2.4-2.4Z" />
  ),
  checkin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

function NavIcon({ name, active }: { name: string; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

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
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
              active ? "text-teal-600" : "text-slate-400"
            }`}
          >
            <NavIcon name={it.icon} active={active} />
            <span className="font-medium">{t(it.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
