"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Heading({ tkey }: { tkey: string }) {
  const { t } = useI18n();
  return <h1 className="mb-3 text-xl font-bold text-slate-800">{t(tkey)}</h1>;
}
