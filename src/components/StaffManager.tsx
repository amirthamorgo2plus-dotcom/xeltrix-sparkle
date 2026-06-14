"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStaff, setStaffActive, updateStaff } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Staff = {
  id: string;
  name: string;
  role: string;
  language: string;
  active: boolean;
};

const ROLE_KEY: Record<string, string> = {
  cleaner: "roleCleaner",
  supervisor: "roleSupervisor",
  owner: "roleOwner",
};

export default function StaffManager({ staff }: { staff: Staff[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("cleaner");
  const [pin, setPin] = useState("");
  const [lang, setLang] = useState("en");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setErr(null);
    if (!name.trim()) return setErr(t("fieldName"));
    if (!/^\d{4}$/.test(pin)) return setErr(t("pinInvalid"));
    startTransition(async () => {
      const res = await addStaff({ name, role, pin, language: lang });
      if (res.ok) {
        setName("");
        setPin("");
        setRole("cleaner");
        router.refresh();
      } else {
        setErr(res.error === "pin" ? t("pinInvalid") : t("uploadFailed"));
      }
    });
  }

  function toggle(s: Staff) {
    startTransition(async () => {
      await setStaffActive(s.id, !s.active);
      router.refresh();
    });
  }

  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div>
      {/* Add form */}
      <div className="mb-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-semibold text-stone-800">{t("addEmployee")}</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("fieldName")}
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white p-3 text-sm"
            aria-label={t("fieldRole")}
          >
            <option value="cleaner">{t("roleCleaner")}</option>
            <option value="supervisor">{t("roleSupervisor")}</option>
            <option value="owner">{t("roleOwner")}</option>
          </select>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white p-3 text-sm"
            aria-label={t("fieldLang")}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder={t("fieldPin")}
          inputMode="numeric"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm tracking-widest"
        />
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <button
          onClick={save}
          disabled={pending}
          className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          ＋ {t("addEmployee")}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {staff.map((s) =>
          editId === s.id ? (
            <EditRow key={s.id} staff={s} onDone={() => setEditId(null)} />
          ) : (
            <div
              key={s.id}
              className={`flex items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-sm ${
                s.active ? "" : "opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-800">{s.name}</p>
                <p className="text-xs text-stone-500">{t(ROLE_KEY[s.role] ?? s.role)}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setEditId(s.id)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => toggle(s)}
                  disabled={pending}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                    s.active
                      ? "border border-rose-300 bg-rose-50 text-rose-700"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {s.active ? t("deactivate") : t("activate")}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EditRow({ staff, onDone }: { staff: Staff; onDone: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(staff.name);
  const [role, setRole] = useState(staff.role);
  const [lang, setLang] = useState(staff.language);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setErr(null);
    if (!name.trim()) return setErr(t("fieldName"));
    if (pin && !/^\d{4}$/.test(pin)) return setErr(t("pinInvalid"));
    startTransition(async () => {
      const res = await updateStaff({ id: staff.id, name, role, language: lang, pin });
      if (res.ok) {
        onDone();
        router.refresh();
      } else {
        setErr(res.error === "pin" ? t("pinInvalid") : t("uploadFailed"));
      }
    });
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-2 ring-amber-200">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("fieldName")}
        className="w-full rounded-xl border border-stone-300 p-3 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white p-3 text-sm"
        >
          <option value="cleaner">{t("roleCleaner")}</option>
          <option value="supervisor">{t("roleSupervisor")}</option>
          <option value="owner">{t("roleOwner")}</option>
        </select>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white p-3 text-sm"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder={t("newPinOptional")}
        inputMode="numeric"
        className="w-full rounded-xl border border-stone-300 p-3 text-sm tracking-widest"
      />
      <p className="text-xs text-stone-400">🔒 {t("pinHiddenNote")}</p>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={pending}
          className="flex-1 rounded-xl bg-amber-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {t("save")}
        </button>
        <button
          onClick={onDone}
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-500"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
