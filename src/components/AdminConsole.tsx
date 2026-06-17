"use client";
import { useEffect, useState, useTransition } from "react";
import {
  getAdminData,
  adminLogin,
  adminLogout,
  createOrg,
  resolveFeedback,
  type AdminHotel,
  type AdminFeedback,
} from "@/app/actions/auth";

function fmtBytes(b: number): string {
  if (!b) return "0 MB";
  const mb = b / (1024 * 1024);
  if (mb < 1) return `${(b / 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}
function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export default function AdminConsole() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedback[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [pending, startTransition] = useTransition();

  async function load(): Promise<boolean> {
    const res = await getAdminData();
    if (res.ok) {
      setUnlocked(true);
      setHotels(res.hotels ?? []);
      setFeedback(res.feedback ?? []);
      setErr(null);
      return true;
    }
    return false;
  }

  // Already logged in? (admin cookie present) → skip the prompt.
  useEffect(() => {
    load().finally(() => setChecking(false));
  }, []);

  function unlock() {
    startTransition(async () => {
      const res = await adminLogin(key);
      if (res.ok) {
        setKey("");
        await load();
      } else {
        setErr("Wrong admin key");
      }
    });
  }

  function logout() {
    startTransition(async () => {
      await adminLogout();
      setUnlocked(false);
    });
  }

  if (checking) {
    return <div className="p-6 text-sm text-stone-400">Loading…</div>;
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="mb-1 text-2xl font-bold text-stone-800">Admin console</h1>
        <p className="mb-6 text-sm text-stone-500">Super-admin only.</p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
          placeholder="Admin key"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
        <button
          onClick={unlock}
          disabled={pending || !key}
          className="mt-3 w-full rounded-xl bg-amber-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          Unlock
        </button>
      </div>
    );
  }

  const totalStorage = hotels.reduce((a, h) => a + h.storageBytes, 0);
  const openFeedback = feedback.filter((f) => !f.resolved).length;

  return (
    <div className="mx-auto max-w-md space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Admin console</h1>
        <button
          onClick={logout}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-600"
        >
          Log out
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Hotels" value={String(hotels.length)} />
        <Stat label="Storage" value={fmtBytes(totalStorage)} />
        <Stat label="Open feedback" value={String(openFeedback)} />
      </div>

      {/* Hotels */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Hotels</h2>
        <div className="space-y-2">
          {hotels.map((h) => (
            <div key={h.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {h.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.logoUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-700">
                      {h.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <p className="truncate font-semibold text-stone-800">{h.name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
                  /h/{h.slug}
                </span>
              </div>
              {(h.address || (h.lat != null && h.lng != null)) && (
                <a
                  href={mapsUrl(h)!}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-amber-700"
                >
                  📍 {h.address || "Directions"} ↗
                </a>
              )}
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <Mini label="Members" value={String(h.members)} />
                <Mini label="Storage" value={fmtBytes(h.storageBytes)} />
                <Mini label="Last login" value={h.lastLoginAt ? timeAgo(h.lastLoginAt) : "never"} />
              </div>
              <p className="mt-2 text-[11px] text-stone-400">
                Last login: {fmtDate(h.lastLoginAt)}
              </p>
            </div>
          ))}
          {hotels.length === 0 && (
            <p className="text-sm text-stone-400">No hotels yet.</p>
          )}
        </div>
      </section>

      {/* Feedback */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">
          Complaints & feedback
        </h2>
        <div className="space-y-2">
          {feedback.map((f) => (
            <div
              key={f.id}
              className={`rounded-2xl bg-white p-4 shadow-sm ${
                f.resolved ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-stone-800">{f.message}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    {f.orgName} · {f.staffName ?? "—"} · {fmtDate(f.createdAt)}
                  </p>
                </div>
                {!f.resolved && (
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await resolveFeedback(f.id);
                        await load();
                      })
                    }
                    className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-sm text-stone-400">No feedback yet.</p>
          )}
        </div>
      </section>

      {/* Provision */}
      <ProvisionForm onCreated={() => load()} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 p-3 text-center ring-1 ring-inset ring-amber-100">
      <p className="text-lg font-bold text-amber-800">{value}</p>
      <p className="text-[11px] text-stone-500">{label}</p>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 py-1.5">
      <p className="text-sm font-bold text-stone-800">{value}</p>
      <p className="text-[10px] text-stone-500">{label}</p>
    </div>
  );
}
function mapsUrl(h: AdminHotel): string | null {
  const q = h.lat != null && h.lng != null ? `${h.lat},${h.lng}` : h.address;
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}
function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ProvisionForm({ onCreated }: { onCreated: () => void }) {
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPin, setOwnerPin] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function uploadLogo(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.url) setLogoUrl(json.url);
    } finally {
      setUploading(false);
    }
  }

  const ERRORS: Record<string, string> = {
    auth: "Wrong admin key",
    fields: "Fill in all fields",
    slug: "Code must be 2–30 lowercase letters/numbers/dashes",
    pin: "Owner PIN must be 4 digits",
    slugExists: "That hotel code is already taken",
  };
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function submit() {
    setErr(null);
    setResult(null);
    startTransition(async () => {
      const res = await createOrg({ orgName, slug, ownerName, ownerPin, logoUrl, address });
      if (res.ok && res.slug) {
        setResult(`${origin}/h/${res.slug}`);
        setOrgName("");
        setSlug("");
        setOwnerName("");
        setOwnerPin("");
        setAddress("");
        setLogoUrl(null);
        onCreated();
      } else {
        setErr(ERRORS[res.error ?? ""] ?? "Could not create hotel");
      }
    });
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-stone-700">Provision a hotel</h2>
      {result && (
        <div className="mb-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs">
          <p className="font-semibold text-emerald-800">Created ✅ Share this link:</p>
          <p className="mt-1 break-all font-mono text-emerald-900">{result}</p>
        </div>
      )}
      <div className="space-y-2">
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Hotel name" className="w-full rounded-xl border border-stone-300 p-2.5 text-sm" />
        <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="Hotel code (e.g. grandpalace)" autoCapitalize="none" className="w-full rounded-xl border border-stone-300 p-2.5 text-sm" />
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Owner name" className="w-full rounded-xl border border-stone-300 p-2.5 text-sm" />
        <input value={ownerPin} onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Owner 4-digit PIN" inputMode="numeric" className="w-full rounded-xl border border-stone-300 p-2.5 text-sm tracking-widest" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (for map directions)" className="w-full rounded-xl border border-stone-300 p-2.5 text-sm" />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 p-2.5 text-sm text-stone-600">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <span>🖼️</span>
          )}
          {uploading ? "Uploading…" : logoUrl ? "Logo added — change" : "Add logo (optional)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)} />
        </label>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="w-full rounded-xl bg-amber-600 py-2.5 font-semibold text-white disabled:opacity-50">
          Create hotel
        </button>
      </div>
    </section>
  );
}
