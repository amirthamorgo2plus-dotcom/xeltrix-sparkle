"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopBar({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-10 rounded-b-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-4 py-3 text-white shadow-md shadow-amber-900/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold leading-tight">✨ {t("appName")}</p>
          <p className="text-xs text-amber-100">
            {name} · {role}
          </p>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="rounded-full bg-white/15 px-3 py-1 text-sm"
        >
          {t("logout")}
        </button>
      </div>
      <div className="mt-2 flex justify-end">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
