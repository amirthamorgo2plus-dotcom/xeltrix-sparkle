"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

const COLORS: Record<string, string> = {
  emerald: "from-emerald-50 to-emerald-100/60 text-emerald-700 ring-emerald-100",
  blue: "from-blue-50 to-blue-100/60 text-blue-700 ring-blue-100",
  rose: "from-rose-50 to-rose-100/60 text-rose-700 ring-rose-100",
  teal: "from-amber-50 to-amber-100/60 text-amber-700 ring-amber-100",
};

export default function StatTile({
  value,
  tkey,
  color,
}: {
  value: number;
  tkey: string;
  color: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br p-4 ring-1 ring-inset ${COLORS[color]}`}
    >
      <p className="text-3xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-sm font-medium">{t(tkey)}</p>
    </div>
  );
}
