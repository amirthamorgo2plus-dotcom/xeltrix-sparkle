"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrgEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go() {
    const slug = code.trim().toLowerCase();
    if (slug) router.push(`/h/${slug}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-amber-600 to-amber-800 px-6 text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
        ✨
      </div>
      <h1 className="text-2xl font-bold">Xeltrix Sparkle</h1>
      <p className="mb-8 text-sm text-amber-100">Hotel housekeeping & operations</p>

      <label className="mb-2 self-start text-sm text-amber-100">
        Enter your hotel code
      </label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && go()}
        placeholder="e.g. sparkle"
        autoCapitalize="none"
        autoCorrect="off"
        className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-white placeholder:text-amber-100/70 focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <button
        onClick={go}
        disabled={!code.trim()}
        className="mt-4 w-full rounded-2xl bg-white py-3 text-lg font-bold text-amber-700 disabled:opacity-40"
      >
        Continue
      </button>
      <p className="mt-6 text-center text-xs text-amber-100/80">
        Open the link your hotel gave you, or type its code above.
      </p>
    </div>
  );
}
