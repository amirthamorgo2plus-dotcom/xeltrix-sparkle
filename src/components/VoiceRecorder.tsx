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
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => chunks.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setBusy(true);
      const fd = new FormData();
      fd.append("file", blob, "voice.webm");
      fd.append("bucket", "voice");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      setBusy(false);
      if (json.url) {
        setUrl(json.url);
        onUploaded(json.url);
      }
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
      {url && (
        <audio controls src={url} className="mt-2 w-full" />
      )}
    </div>
  );
}
