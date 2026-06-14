"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function StarBadge({
  star,
}: {
  star: { name: string; cleaned: number; redos: number } | null;
}) {
  const { t } = useI18n();
  if (!star) return null;
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 ring-1 ring-inset ring-amber-200">
      <span className="text-3xl">🏆</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          {t("starPerformer")}
        </p>
        <p className="truncate text-lg font-bold text-stone-800">{star.name}</p>
        <p className="text-xs text-stone-500">
          {star.cleaned} {t("mRoomsCleaned")} · {star.redos} {t("mRedos")}
        </p>
      </div>
    </div>
  );
}
