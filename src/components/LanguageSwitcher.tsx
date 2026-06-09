"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LANGS } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 rounded-full bg-white/20 p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            lang === l.code ? "bg-white text-teal-700" : "text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
