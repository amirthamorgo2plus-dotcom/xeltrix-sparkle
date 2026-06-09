"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { markFixed } from "@/app/actions/data";

type Issue = {
  id: string;
  room_no: string;
  issue: string;
  photo_url: string | null;
  voice_url: string | null;
  reported_name: string;
  status: string;
};

export default function IssueCard({
  issue,
  canFix,
}: {
  issue: Issue;
  canFix: boolean;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState(issue.status);
  const [busy, setBusy] = useState(false);

  async function fix() {
    setBusy(true);
    await markFixed(issue.id);
    setStatus("fixed");
    setBusy(false);
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{issue.issue}</p>
          <p className="text-xs text-slate-500">
            {t("room")} {issue.room_no} · {issue.reported_name}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "open"
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {status === "open" ? t("open") : t("fixed")}
        </span>
      </div>

      {issue.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={issue.photo_url}
          alt=""
          className="mt-2 h-32 w-full rounded-lg object-cover"
        />
      )}
      {issue.voice_url && (
        <audio controls src={issue.voice_url} className="mt-2 w-full" />
      )}

      {canFix && status === "open" && (
        <button
          onClick={fix}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          ✅ {t("markFixed")}
        </button>
      )}
    </div>
  );
}
