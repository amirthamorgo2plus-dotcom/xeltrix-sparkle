"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { submitFeedback } from "@/app/actions/data";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function FeedbackForm() {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function send() {
    if (!msg.trim()) return;
    startTransition(async () => {
      const res = await submitFeedback(msg);
      if (res.ok) {
        setSent(true);
        setMsg("");
      }
    });
  }

  return (
    <div>
      <Link href="/dashboard" className="mb-3 inline-block text-sm text-amber-600">
        ← {t("back")}
      </Link>
      <h1 className="mb-1 text-xl font-bold text-stone-800">{t("feedbackTitle")}</h1>
      <p className="mb-4 text-sm text-stone-500">{t("feedbackHint")}</p>

      {sent ? (
        <p className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          ✅ {t("feedbackSent")}
        </p>
      ) : (
        <>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={t("feedbackPlaceholder")}
            rows={5}
            className="mb-3 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"
          />
          <button
            onClick={send}
            disabled={pending || !msg.trim()}
            className="w-full rounded-2xl bg-amber-600 py-3 text-lg font-semibold text-white disabled:opacity-50"
          >
            {t("send")}
          </button>
        </>
      )}
    </div>
  );
}
