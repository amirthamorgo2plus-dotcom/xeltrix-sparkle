"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

const COLORS: Record<string, string> = {
  dirty: "bg-stone-200 text-stone-700",
  cleaning: "bg-amber-100 text-amber-800",
  to_inspect: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  maintenance: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = "status" + status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        COLORS[status] ?? "bg-stone-200 text-stone-700"
      }`}
    >
      {t(key)}
    </span>
  );
}
