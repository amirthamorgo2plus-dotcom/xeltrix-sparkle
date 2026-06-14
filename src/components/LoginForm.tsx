"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

type Staff = { id: string; name: string; role: string };

export default function LoginForm({ staff }: { staff: Staff[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [picked, setPicked] = useState<Staff | null>(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submitPin(value: string) {
    if (!picked || value.length !== 4) return;
    setBusy(true);
    setErr(false);
    const res = await login(picked.id, value);
    setBusy(false);
    if (res.ok) router.push("/");
    else {
      setErr(true);
      setPin("");
    }
  }

  function press(d: string) {
    if (pin.length >= 4) return;
    setPin(pin + d);
    setErr(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-br from-orange-500 via-amber-600 to-amber-800 px-6 text-white">
      <div className="flex justify-end pt-4">
        <LanguageSwitcher />
      </div>

      <div className="mt-10 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
          ✨
        </div>
        <h1 className="text-2xl font-bold">{t("appName")}</h1>
        <p className="text-sm text-amber-100">{t("tagline")}</p>
      </div>

      {!picked ? (
        <div className="mt-8">
          <p className="mb-3 text-center text-amber-100">{t("selectName")}</p>
          <div className="grid grid-cols-2 gap-3">
            {staff.map((s) => (
              <button
                key={s.id}
                onClick={() => setPicked(s)}
                className="rounded-2xl bg-white/15 px-4 py-4 text-left font-semibold hover:bg-white/25"
              >
                {s.name}
                <span className="block text-xs font-normal text-amber-100">
                  {s.role}
                </span>
              </button>
            ))}
            {staff.length === 0 && (
              <p className="col-span-2 text-center text-amber-100">
                No staff yet — run the seed script.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setPicked(null);
              setPin("");
              setErr(false);
            }}
            className="mb-4 text-sm text-amber-100"
          >
            ← {picked.name}
          </button>
          <p className="mb-4 text-amber-100">{t("enterPin")}</p>
          <div className="mb-4 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full ${
                  pin.length > i ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
          {err && <p className="mb-3 text-sm text-rose-200">{t("wrongPin")}</p>}
          <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                disabled={busy}
                onClick={() => press(d)}
                className="rounded-2xl bg-white/15 py-4 text-2xl font-semibold hover:bg-white/25"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => setPin(pin.slice(0, -1))}
              className="rounded-2xl bg-white/10 py-4 text-xl"
            >
              ⌫
            </button>
            <button
              disabled={busy}
              onClick={() => press("0")}
              className="rounded-2xl bg-white/15 py-4 text-2xl font-semibold hover:bg-white/25"
            >
              0
            </button>
            <button
              disabled={busy || pin.length !== 4}
              onClick={() => submitPin(pin)}
              aria-label={t("login")}
              className="rounded-2xl bg-white py-4 text-xl font-bold text-amber-700 disabled:opacity-40"
            >
              {busy ? "…" : "✓"}
            </button>
          </div>

          <button
            disabled={busy || pin.length !== 4}
            onClick={() => submitPin(pin)}
            className="mx-auto mt-5 block w-full max-w-xs rounded-2xl bg-white py-4 text-lg font-bold text-amber-700 disabled:opacity-40"
          >
            {busy ? t("saving") : t("login")}
          </button>
        </div>
      )}
    </div>
  );
}
