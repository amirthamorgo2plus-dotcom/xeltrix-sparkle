"use client";
import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function VoiceRecorder({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Pick a container the browser actually supports (iOS Safari = mp4, not webm).
  function pickMime(): string {
    const MR = typeof MediaRecorder !== "undefined" ? MediaRecorder : null;
    if (!MR || !MR.isTypeSupported) return "";
    for (const m of ["audio/webm", "audio/mp4", "audio/ogg"]) {
      if (MR.isTypeSupported(m)) return m;
    }
    return "";
  }

  async function start() {
    setErr(null);
    if (
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setErr(t("recordUnsupported"));
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr(t("micBlocked"));
      return;
    }
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(chunks.current, { type: rec.mimeType || mime });
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", blob, `voice.${ext}`);
        fd.append("bucket", "voice");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.url) {
          setUrl(json.url);
          onUploaded(json.url);
        } else {
          console.error("voice upload failed", res.status, json);
          setErr(t("uploadFailed"));
        }
      } catch (e) {
        console.error(e);
        setErr(t("uploadFailed"));
      }
      setBusy(false);
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
  }

  function stop() {
    recRef.current?.stop();
    setRecording(false);
  }

  return (
    <div>
      {!recording ? (
        <button
          type="button"
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50 py-4 font-medium text-rose-700"
        >
          🎙️ {busy ? t("saving") : t("recordVoice")}
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-4 font-medium text-white"
        >
          ⏹️ {t("stop")} <span className="animate-pulse">●</span>
        </button>
      )}
      {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
      {url && (
        <audio controls src={url} className="mt-2 w-full" />
      )}
    </div>
  );
}
