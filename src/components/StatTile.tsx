"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

const COLORS: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  rose: "bg-rose-50 text-rose-700",
  teal: "bg-teal-50 text-teal-700",
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
    <div className={`rounded-2xl p-4 ${COLORS[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium">{t(tkey)}</p>
    </div>
  );
}
