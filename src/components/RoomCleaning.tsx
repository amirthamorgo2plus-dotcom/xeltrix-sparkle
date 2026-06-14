"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { markCleaned, addRoomPhoto } from "@/app/actions/data";
import PhotoUpload from "./PhotoUpload";
import StatusBadge from "./StatusBadge";

type Room = {
  id: string;
  room_no: string;
  status: string;
  floor: boolean;
  bathroom: boolean;
  bed: boolean;
  bin: boolean;
  ac: boolean;
};

const ITEMS: { key: keyof Check; label: string }[] = [
  { key: "floor", label: "ckFloor" },
  { key: "bathroom", label: "ckBathroom" },
  { key: "bed", label: "ckBed" },
  { key: "bin", label: "ckBin" },
  { key: "ac", label: "ckAc" },
];
type Check = { floor: boolean; bathroom: boolean; bed: boolean; bin: boolean; ac: boolean };

export default function RoomCleaning({
  room,
  photos,
}: {
  room: Room;
  photos: string[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [chk, setChk] = useState<Check>({
    floor: room.floor,
    bathroom: room.bathroom,
    bed: room.bed,
    bin: room.bin,
    ac: room.ac,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await markCleaned(room.id, chk);
    router.push("/rooms");
  }

  return (
    <div>
      <Link href="/rooms" className="mb-3 inline-block text-sm text-amber-600">
        ← {t("back")}
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("room")} {room.room_no}
        </h1>
        <StatusBadge status={room.status} />
      </div>

      {/* checklist */}
      <div className="space-y-1 rounded-2xl bg-white p-2 shadow-sm">
        {ITEMS.map((it) => (
          <button
            key={it.key}
            onClick={() => setChk((c) => ({ ...c, [it.key]: !c[it.key] }))}
            className="flex w-full items-center justify-between px-3 py-3"
          >
            <span className="font-medium">{t(it.label)}</span>
            <span
              className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                chk[it.key] ? "bg-emerald-500" : "bg-stone-300"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition ${
                  chk[it.key] ? "translate-x-5" : ""
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {/* photos */}
      <div className="mt-4">
        <PhotoUpload onUploaded={(url) => addRoomPhoto(room.id, url)} />
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>

      {/* actions */}
      <button
        onClick={save}
        disabled={busy}
        className="mt-5 w-full rounded-2xl bg-amber-600 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {busy ? t("saving") : t("markCleaned")}
      </button>

      <Link
        href={`/issues/new?room=${room.id}&no=${room.room_no}`}
        className="mt-3 block w-full rounded-2xl border border-rose-300 bg-rose-50 py-3 text-center font-medium text-rose-700"
      >
        🔧 {t("reportIssue")}
      </Link>
    </div>
  );
}
