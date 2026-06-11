"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { reportIssue } from "@/app/actions/data";
import PhotoUpload from "./PhotoUpload";
import VoiceRecorder from "./VoiceRecorder";

type Room = { id: string; room_no: string };

export default function ReportIssueForm({
  rooms,
  prefillRoomId,
}: {
  rooms: Room[];
  prefillRoomId: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [roomId, setRoomId] = useState(prefillRoomId ?? rooms[0]?.id ?? "");
  const [issue, setIssue] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [urgent, setUrgent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const CATEGORIES = [
    { value: "plumbing", key: "catPlumbing" },
    { value: "electrical", key: "catElectrical" },
    { value: "ac", key: "catAc" },
    { value: "furniture", key: "catFurniture" },
    { value: "cleaning", key: "catCleaning" },
    { value: "other", key: "catOther" },
  ];

  async function submit() {
    if (!issue.trim()) return;
    setBusy(true);
    const room = rooms.find((r) => r.id === roomId);
    await reportIssue({
      roomId: roomId || null,
      roomNo: room?.room_no ?? "",
      issue: issue.trim(),
      category,
      urgent,
      photoUrl: photo,
      voiceUrl: voice,
    });
    router.push("/issues");
  }

  return (
    <div>
      <Link href="/issues" className="mb-3 inline-block text-sm text-teal-600">
        ← {t("back")}
      </Link>
      <h1 className="mb-4 text-xl font-bold">{t("reportIssue")}</h1>

      <label className="mb-1 block text-sm font-medium text-slate-600">
        {t("room")}
      </label>
      <select
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3"
      >
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {t("room")} {r.room_no}
          </option>
        ))}
      </select>

      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder={t("issue")}
        rows={3}
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3"
      />

      <label className="mb-1 block text-sm font-medium text-slate-600">
        {t("category")}
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {t(c.key)}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setUrgent((v) => !v)}
        className={`mb-4 flex w-full items-center justify-between rounded-xl border p-3 ${
          urgent
            ? "border-rose-300 bg-rose-50 text-rose-700"
            : "border-slate-300 bg-white text-slate-600"
        }`}
      >
        <span className="font-medium">⚠️ {t("urgent")}</span>
        <span
          className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
            urgent ? "bg-rose-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white transition ${
              urgent ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>

      <div className="mb-3">
        <PhotoUpload onUploaded={(url) => setPhoto(url)} />
      </div>
      <div className="mb-4">
        <VoiceRecorder onUploaded={(url) => setVoice(url)} />
      </div>

      <button
        onClick={submit}
        disabled={busy || !issue.trim()}
        className="w-full rounded-2xl bg-rose-600 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {busy ? t("saving") : t("submit")}
      </button>
    </div>
  );
}
