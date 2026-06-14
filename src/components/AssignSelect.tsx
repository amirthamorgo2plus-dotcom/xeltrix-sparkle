"use client";
import { useState, useTransition } from "react";
import { assignRoom } from "@/app/actions/data";
import { useI18n } from "@/lib/i18n/I18nProvider";

export type Cleaner = { id: string; name: string };

export default function AssignSelect({
  roomId,
  cleaners,
  assignedTo,
}: {
  roomId: string;
  cleaners: Cleaner[];
  assignedTo: string | null;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(assignedTo ?? "");
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    startTransition(() => {
      assignRoom(roomId, next === "" ? null : next);
    });
  }

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={pending}
      aria-label={t("assignTo")}
      className={`rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-700 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <option value="">{t("unassigned")}</option>
      {cleaners.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
