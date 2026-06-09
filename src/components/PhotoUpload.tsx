"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function PhotoUpload({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        const fd = new FormData();
        fd.append("file", compressed, file.name.replace(/\.\w+$/, ".jpg"));
        fd.append("bucket", "photos");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) {
          setThumbs((p) => [...p, json.url]);
          onUploaded(json.url);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setBusy(false);
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 py-4 font-medium text-teal-700">
        📷 {busy ? t("saving") : t("addPhotos")}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {thumbs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {thumbs.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={u}
              alt=""
              className="h-16 w-16 rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
