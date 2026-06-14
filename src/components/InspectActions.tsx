"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { approveRoom, redoRoom } from "@/app/actions/data";

type Room = {
  id: string;
  room_no: string;
  floor: boolean;
  bathroom: boolean;
  bed: boolean;
  bin: boolean;
  ac: boolean;
};

const ITEMS: { key: keyof Room; label: string }[] = [
  { key: "floor", label: "ckFloor" },
  { key: "bathroom", label: "ckBathroom" },
  { key: "bed", label: "ckBed" },
  { key: "bin", label: "ckBin" },
  { key: "ac", label: "ckAc" },
];

export default function InspectActions({
  room,
  photos,
  openIssues,
}: {
  room: Room;
  photos: string[];
  openIssues: number;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const blocked = openIssues > 0;

  async function approve() {
    setBusy(true);
    try {
      await approveRoom(room.id);
      router.push("/inspect");
    } catch {
      setBusy(false);
    }
  }
  async function redo() {
    setBusy(true);
    await redoRoom(room.id);
    router.push("/inspect");
  }

  return (
    <div>
      <Link href="/inspect" className="mb-3 inline-block text-sm text-amber-600">
        ← {t("back")}
      </Link>
      <h1 className="mb-4 text-2xl font-bold">
        {t("room")} {room.room_no}
      </h1>

      {/* checklist result (read-only) */}
      <div className="rounded-2xl bg-white p-2 shadow-sm">
        {ITEMS.map((it) => (
          <div key={it.key} className="flex items-center justify-between px-3 py-2">
            <span>{t(it.label)}</span>
            <span className={room[it.key] ? "text-emerald-600" : "text-rose-500"}>
              {room[it.key] ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>

      {/* photos */}
      {photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={u} alt="" className="h-24 w-24 rounded-lg object-cover" />
          ))}
        </div>
      )}

      {/* actions */}
      {blocked ? (
        <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-center font-medium text-rose-700">
          ⚠ {t("clearMaintenanceFirst")}
        </p>
      ) : (
        <button
          onClick={approve}
          disabled={busy}
          className="mt-5 w-full rounded-2xl bg-emerald-600 py-4 text-lg font-semibold text-white disabled:opacity-60"
        >
          ✅ {t("approve")}
        </button>
      )}
      <button
        onClick={redo}
        disabled={busy}
        className="mt-3 w-full rounded-2xl border border-rose-300 bg-white py-3 font-medium text-rose-600"
      >
        ↩ {t("redo")}
      </button>
    </div>
  );
}
