"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import StatusBadge from "./StatusBadge";
import IssueCard from "./IssueCard";

export type RoomIssue = {
  id: string;
  room_no: string;
  issue: string;
  category?: string | null;
  urgent?: boolean | null;
  photo_url: string | null;
  voice_url: string | null;
  reported_name: string;
  status: string;
};

export default function RoomOverview({
  roomNo,
  status,
  photos,
  issues,
  canFix,
  backHref,
}: {
  roomNo: string;
  status: string;
  photos: string[];
  issues: RoomIssue[];
  canFix: boolean;
  backHref: string;
}) {
  const { t } = useI18n();

  return (
    <div>
      <Link href={backHref} className="mb-3 inline-block text-sm text-amber-600">
        ← {t("back")}
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("room")} {roomNo}
        </h1>
        <StatusBadge status={status} />
      </div>

      {/* Photos */}
      <h2 className="mb-2 text-sm font-semibold text-stone-700">
        {t("photosTitle")}
      </h2>
      {photos.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-400 shadow-sm">
          {t("noPhotos")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <a key={i} href={u} target="_blank" rel="noreferrer">
              <img
                src={u}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {/* Issues (with image + audio) */}
      <h2 className="mb-2 mt-5 text-sm font-semibold text-stone-700">
        {t("issuesTitle")}
      </h2>
      {issues.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-400 shadow-sm">
          {t("noIssues")}
        </p>
      ) : (
        <div className="space-y-2">
          {issues.map((it) => (
            <IssueCard key={it.id} issue={it} canFix={canFix} />
          ))}
        </div>
      )}
    </div>
  );
}
