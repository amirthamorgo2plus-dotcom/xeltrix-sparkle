"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopBar({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold leading-tight">✨ {t("appName")}</p>
          <p className="text-xs text-teal-100">
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
