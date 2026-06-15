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

export type RoomEvent = {
  id: string;
  event: string;
  cleaner_name: string | null;
  duration_secs: number | null;
  created_at: string;
};

const EVENT_META: Record<string, { key: string; icon: string; color: string }> = {
  cleaned: { key: "evCleaned", icon: "🧹", color: "text-blue-600" },
  redo: { key: "evRedo", icon: "↩️", color: "text-rose-600" },
  approved: { key: "evApproved", icon: "✅", color: "text-emerald-600" },
};

function fmtDur(secs: number | null): string {
  if (secs == null) return "";
  const m = Math.round(secs / 60);
  return m < 60 ? ` · ${m}m` : ` · ${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function RoomOverview({
  roomNo,
  status,
  photos,
  issues,
  history = [],
  canFix,
  backHref,
}: {
  roomNo: string;
  status: string;
  photos: string[];
  issues: RoomIssue[];
  history?: RoomEvent[];
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

      {/* History timeline */}
      {history.length > 0 && (
        <>
          <h2 className="mb-2 mt-5 text-sm font-semibold text-stone-700">
            {t("historyTitle")}
          </h2>
          <ol className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            {history.map((e) => {
              const meta = EVENT_META[e.event] ?? {
                key: e.event,
                icon: "•",
                color: "text-stone-500",
              };
              return (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="text-lg leading-none">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${meta.color}`}>
                      {t(meta.key)}
                      {e.event === "cleaned" && (
                        <span className="text-stone-400">{fmtDur(e.duration_secs)}</span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500">
                      {e.cleaner_name ?? "—"} ·{" "}
                      {new Date(e.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
