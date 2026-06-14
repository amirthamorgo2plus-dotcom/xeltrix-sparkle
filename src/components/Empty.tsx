"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Empty({ tkey }: { tkey: string }) {
  const { t } = useI18n();
  return (
    <p className="py-12 text-center text-sm text-stone-400">{t(tkey)}</p>
  );
}
