"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function RoomLabel({ no }: { no: string }) {
  const { t } = useI18n();
  return (
    <span>
      {t("room")} {no}
    </span>
  );
}
