"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addRoom } from "@/app/actions/data";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AddRoom() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [no, setNo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setErr(null);
    const value = no.trim();
    if (!value) return;
    startTransition(async () => {
      const res = await addRoom(value);
      if (res.ok) {
        setNo("");
        setOpen(false);
        router.refresh();
      } else {
        setErr(res.error === "exists" ? t("roomExists") : t("uploadFailed"));
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700"
      >
        ＋ {t("addRoom")}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={no}
          onChange={(e) => setNo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder={t("roomNumber")}
          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
        <button
          onClick={save}
          disabled={pending || !no.trim()}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("add")}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setNo("");
            setErr(null);
          }}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500"
        >
          {t("cancel")}
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </div>
  );
}
