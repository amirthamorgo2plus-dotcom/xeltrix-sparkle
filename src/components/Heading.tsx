"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Heading({ tkey }: { tkey: string }) {
  const { t } = useI18n();
  return <h1 className="mb-3 text-xl font-bold text-slate-800">{t(tkey)}</h1>;
}

export function SubHeading({ tkey }: { tkey: string }) {
  const { t } = useI18n();
  return (
    <h2 className="mb-2 text-sm font-semibold text-slate-700">{t(tkey)}</h2>
  );
}
