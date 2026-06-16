"use client";
import { useState, useTransition } from "react";
import { createOrg } from "@/app/actions/auth";

export default function AdminProvision() {
  const [adminKey, setAdminKey] = useState("");
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPin, setOwnerPin] = useState("");
  const [result, setResult] = useState<{ slug: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ERRORS: Record<string, string> = {
    auth: "Wrong admin key",
    fields: "Fill in all fields",
    slug: "Code must be 2–30 lowercase letters/numbers/dashes",
    pin: "Owner PIN must be 4 digits",
    slugExists: "That hotel code is already taken",
  };

  function submit() {
    setErr(null);
    setResult(null);
    startTransition(async () => {
      const res = await createOrg({ adminKey, orgName, slug, ownerName, ownerPin });
      if (res.ok && res.slug) {
        setResult({ slug: res.slug });
        setOrgName("");
        setSlug("");
        setOwnerName("");
        setOwnerPin("");
      } else {
        setErr(ERRORS[res.error ?? ""] ?? "Could not create hotel");
      }
    });
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold text-stone-800">Provision a hotel</h1>
      <p className="mb-6 text-sm text-stone-500">
        Super-admin only. Creates a new hotel and its owner login.
      </p>

      {result && (
        <div className="mb-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
          <p className="font-semibold text-emerald-800">Hotel created ✅</p>
          <p className="mt-1 text-emerald-700">Share this login link with the owner:</p>
          <p className="mt-1 break-all font-mono text-emerald-900">
            {origin}/h/{result.slug}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Admin key"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Hotel name (e.g. Grand Palace)"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        <input
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          placeholder="Hotel code for the link (e.g. grandpalace)"
          autoCapitalize="none"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Owner name"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm"
        />
        <input
          value={ownerPin}
          onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Owner 4-digit PIN"
          inputMode="numeric"
          className="w-full rounded-xl border border-stone-300 p-3 text-sm tracking-widest"
        />
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <button
          onClick={submit}
          disabled={pending}
          className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          Create hotel
        </button>
      </div>
    </div>
  );
}
