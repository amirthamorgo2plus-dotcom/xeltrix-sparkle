"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

// Renders a translated string by key — for use inside server components.
export default function TLabel({ tkey }: { tkey: string }) {
  const { t } = useI18n();
  return <>{t(tkey)}</>;
}
