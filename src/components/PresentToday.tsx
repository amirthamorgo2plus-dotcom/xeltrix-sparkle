"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type PresentPerson = { name: string; check_in: string };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export default function PresentToday({ people }: { people: PresentPerson[] }) {
  const { t } = useI18n();
  return (
    <section className="mb-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {t("presentTodayTitle")}
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
          {people.length}
        </span>
      </h2>

      {people.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
          {t("noPresentYet")}
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-xs font-bold text-white">
                {initials(p.name)}
              </span>
              <span className="flex-1 font-medium text-slate-800">{p.name}</span>
              <span className="text-xs text-slate-400">
                {new Date(p.check_in).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
