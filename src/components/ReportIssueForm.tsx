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
  const [photo, setPhoto] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!issue.trim()) return;
    setBusy(true);
    const room = rooms.find((r) => r.id === roomId);
    await reportIssue({
      roomId: roomId || null,
      roomNo: room?.room_no ?? "",
      issue: issue.trim(),
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
