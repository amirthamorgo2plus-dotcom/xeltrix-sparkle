"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markVacated } from "@/app/actions/data";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function VacateButton({ roomId }: { roomId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function vacate() {
    if (!window.confirm(t("vacateConfirm"))) return;
    startTransition(async () => {
      await markVacated(roomId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={vacate}
      disabled={pending}
      className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 disabled:opacity-50"
    >
      🚪 {t("markVacated")}
    </button>
  );
}
