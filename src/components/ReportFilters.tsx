"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ReportFilters({
  scope,
  value,
}: {
  scope: "day" | "month";
  value: string; // YYYY-MM-DD for day, YYYY-MM for month
}) {
  const { t } = useI18n();
  const router = useRouter();

  function go(nextScope: "day" | "month", nextValue: string) {
    router.push(`/reports?scope=${nextScope}&value=${nextValue}`);
  }

  function switchScope(next: "day" | "month") {
    if (next === scope) return;
    const now = new Date();
    const def =
      next === "day"
        ? now.toISOString().slice(0, 10)
        : now.toISOString().slice(0, 7);
    go(next, def);
  }

  return (
    <div className="mb-5 flex items-center gap-2">
      <div className="flex rounded-xl bg-slate-100 p-1">
        {(["day", "month"] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchScope(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              scope === s ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
            }`}
          >
            {t(s === "day" ? "filterDay" : "filterMonth")}
          </button>
        ))}
      </div>

      <input
        type={scope === "day" ? "date" : "month"}
        value={value}
        onChange={(e) => go(scope, e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm"
      />
    </div>
  );
}
