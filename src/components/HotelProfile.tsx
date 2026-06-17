"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { updateOrgProfile } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Org = {
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
};

export default function HotelProfile({ org }: { org: Org }) {
  const { t } = useI18n();
  const [logoUrl, setLogoUrl] = useState<string | null>(org.logoUrl);
  const [address, setAddress] = useState(org.address ?? "");
  const [lat, setLat] = useState<number | null>(org.lat);
  const [lng, setLng] = useState<number | null>(org.lng);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  async function uploadLogo(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "photos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.url) setLogoUrl(json.url);
    } finally {
      setUploading(false);
    }
  }

  function useLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateOrgProfile({ logoUrl, address, lat, lng });
      setSaved(true);
    });
  }

  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  return (
    <div>
      <Link href="/dashboard" className="mb-3 inline-block text-sm text-amber-600">
        ← {t("back")}
      </Link>
      <h1 className="mb-4 text-xl font-bold text-stone-800">{t("hotelProfile")}</h1>

      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
        {/* Logo */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-600">{t("logoLabel")}</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 p-3 text-sm text-stone-600">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <span className="text-2xl">🖼️</span>
            )}
            {uploading ? t("saving") : t("changeLogo")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* Address */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-600">{t("addressLabel")}</p>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-stone-300 p-3 text-sm"
          />
        </div>

        {/* Location */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useLocation}
            className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
          >
            📍 {t("useMyLocation")}
          </button>
          {lat != null && lng != null && (
            <span className="text-xs text-emerald-600">{t("locationCaptured")}</span>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-amber-700"
            >
              {t("viewOnMap")} ↗
            </a>
          )}
        </div>

        <button
          onClick={save}
          disabled={pending}
          className="w-full rounded-2xl bg-amber-600 py-3 text-lg font-semibold text-white disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
        {saved && <p className="text-center text-sm text-emerald-600">{t("profileSaved")}</p>}
      </div>
    </div>
  );
}
