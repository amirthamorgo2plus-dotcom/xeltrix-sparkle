"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { checkIn } from "@/app/actions/data";

export default function CheckInButton() {
  const { t } = useI18n();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    await checkIn();
    setBusy(false);
    setDone(true);
    router.refresh();
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <button
      onClick={go}
      disabled={busy}
      className="w-full rounded-2xl bg-teal-600 py-5 text-lg font-semibold text-white disabled:opacity-60"
    >
      {done ? `✅ ${t("checkedIn")}` : `🕒 ${t("presentToday")}`}
    </button>
  );
}
