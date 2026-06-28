"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/918220980134";

type RoomStatus = "cleaning" | "to_inspect" | "ready";
type Checks = { floor: boolean; bath: boolean; bed: boolean; bin: boolean; ac: boolean };
type Room = {
  id: string;
  no: string;
  assignee: string;
  status: RoomStatus;
  checks: Checks;
};

const CHECK_LABELS: { key: keyof Checks; label: string }[] = [
  { key: "floor", label: "Floor cleaned" },
  { key: "bath", label: "Bathroom cleaned" },
  { key: "bed", label: "Bed arranged" },
  { key: "bin", label: "Bin emptied" },
  { key: "ac", label: "AC working" },
];

const INITIAL_ROOMS: Room[] = [
  { id: "r101", no: "101", assignee: "Suresh", status: "cleaning", checks: { floor: true, bath: true, bed: false, bin: true, ac: false } },
  { id: "r102", no: "102", assignee: "Lakshmi", status: "to_inspect", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
  { id: "r103", no: "103", assignee: "Raj", status: "ready", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
  { id: "r104", no: "104", assignee: "Pooja", status: "cleaning", checks: { floor: false, bath: false, bed: false, bin: false, ac: false } },
  { id: "r105", no: "105", assignee: "Muthu", status: "ready", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
];

const STATUS_STYLE: Record<RoomStatus, { label: string; cls: string }> = {
  cleaning: { label: "Cleaning", cls: "bg-amber-100 text-amber-800" },
  to_inspect: { label: "To inspect", cls: "bg-blue-100 text-blue-700" },
  ready: { label: "Ready", cls: "bg-emerald-100 text-emerald-700" },
};

type Role = "owner" | "supervisor" | "cleaner";

export default function DemoTour() {
  const [role, setRole] = useState<Role>("cleaner");
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState("r101");
  const [ownerTab, setOwnerTab] = useState<"dashboard" | "reports">("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];
  const counts = useMemo(() => {
    return {
      ready: rooms.filter((r) => r.status === "ready").length,
      toInspect: rooms.filter((r) => r.status === "to_inspect").length,
      cleaning: rooms.filter((r) => r.status === "cleaning").length,
    };
  }, [rooms]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function toggleCheck(roomId: string, key: keyof Checks) {
    setRooms((rs) =>
      rs.map((r) => (r.id === roomId ? { ...r, checks: { ...r.checks, [key]: !r.checks[key] } } : r))
    );
  }

  function markCleaned(roomId: string) {
    setRooms((rs) => rs.map((r) => (r.id === roomId ? { ...r, status: "to_inspect" } : r)));
    flash("Room marked cleaned ✓ — supervisor notified");
  }

  function approve(roomId: string) {
    setRooms((rs) => rs.map((r) => (r.id === roomId ? { ...r, status: "ready" } : r)));
    flash("Inspection passed → Room ready ✓");
  }

  const allChecked = Object.values(activeRoom.checks).every(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-orange-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix Sparkle" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">Xeltrix Sparkle · Live Demo</span>
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            Book a demo
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        {/* Left: explanation + controls */}
        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            🏨 Demo Hotel · Grand Palace Hotel
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-900 md:text-4xl">
            Try Xeltrix Sparkle — right here, no login.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-stone-600">
            This is a real, working demo with sample data. Switch between cleaner,
            supervisor and owner. Tick a checklist, mark a room cleaned, approve it,
            and watch the dashboard update live.
          </p>

          {/* Role switch */}
          <p className="mt-7 text-sm font-semibold text-stone-500">See it as a…</p>
          <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            {([
              { k: "cleaner", l: "🧹 Cleaner" },
              { k: "supervisor", l: "🔍 Supervisor" },
              { k: "owner", l: "📊 Owner" },
            ] as { k: Role; l: string }[]).map((r) => (
              <button
                key={r.k}
                onClick={() => setRole(r.k)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  role === r.k ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {r.l}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
            <p className="font-semibold text-stone-800">What to try 👇</p>
            <ul className="mt-2 space-y-1.5">
              {role === "cleaner" && (
                <>
                  <li>• Pick a room, then toggle the checklist items.</li>
                  <li>• When all 5 are on, tap <b>Mark Cleaned</b>.</li>
                </>
              )}
              {role === "supervisor" && (
                <>
                  <li>• Rooms waiting in <b>To inspect</b> show here.</li>
                  <li>• Tap <b>Approve</b> to pass a room to Ready.</li>
                </>
              )}
              {role === "owner" && (
                <>
                  <li>• See live counts and the room board.</li>
                  <li>• Switch to <b>Reports</b> for attendance & issues.</li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Get this for my hotel
            </a>
            <Link
              href="/login"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-700 hover:bg-stone-100"
            >
              Staff login
            </Link>
          </div>
        </div>

        {/* Right: interactive phone */}
        <div className="flex justify-center md:sticky md:top-24">
          <div className="relative w-[300px] rounded-[2.4rem] bg-stone-900 p-2 shadow-2xl">
            <div className="flex h-[560px] flex-col overflow-hidden rounded-[2rem] bg-stone-50">
              {/* App top bar */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">✨ Xeltrix Sparkle</p>
                    <p className="text-[10px] text-orange-100">
                      {role === "cleaner" && "Suresh · cleaner"}
                      {role === "supervisor" && "Harish · supervisor"}
                      {role === "owner" && "Saratha · owner"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">🔔 Alerts</span>
                </div>
              </div>

              {/* Screen body (scrolls) */}
              <div className="relative flex-1 overflow-y-auto p-3">
                {/* CLEANER */}
                {role === "cleaner" && (
                  <>
                    <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                      {rooms.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setActiveRoomId(r.id)}
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            r.id === activeRoomId ? "bg-amber-600 text-white" : "bg-white text-stone-600 shadow-sm"
                          }`}
                        >
                          {r.no}
                        </button>
                      ))}
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-stone-800">Room {activeRoom.no}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[activeRoom.status].cls}`}>
                        {STATUS_STYLE[activeRoom.status].label}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white shadow-sm">
                      {CHECK_LABELS.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleCheck(activeRoom.id, key)}
                          className="flex w-full items-center justify-between border-b border-stone-100 px-3 py-3 last:border-0"
                        >
                          <span className="text-xs text-stone-700">{label}</span>
                          <span
                            className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                              activeRoom.checks[key] ? "bg-emerald-500" : "bg-stone-300"
                            }`}
                          >
                            <span
                              className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                activeRoom.checks[key] ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2.5 text-xs font-medium text-amber-700">
                      📷 Add photos
                    </div>
                    <button
                      disabled={!allChecked || activeRoom.status !== "cleaning"}
                      onClick={() => markCleaned(activeRoom.id)}
                      className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {activeRoom.status === "to_inspect"
                        ? "Sent for inspection ✓"
                        : allChecked
                        ? "Mark Cleaned"
                        : "Finish all items to submit"}
                    </button>
                    <button className="mt-1.5 w-full rounded-xl bg-pink-50 py-2 text-xs font-semibold text-pink-600">
                      🔧 Report Issue
                    </button>
                  </>
                )}

                {/* SUPERVISOR */}
                {role === "supervisor" && (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Awaiting inspection</p>
                    {rooms.filter((r) => r.status === "to_inspect").length === 0 && (
                      <p className="rounded-xl bg-white p-4 text-center text-xs text-stone-400 shadow-sm">
                        All caught up 🎉 No rooms waiting.
                      </p>
                    )}
                    {rooms
                      .filter((r) => r.status === "to_inspect")
                      .map((r) => (
                        <div key={r.id} className="mb-2 rounded-xl bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-stone-800">Room {r.no}</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">To inspect</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-stone-500">Cleaned by {r.assignee}</p>
                          <button
                            onClick={() => approve(r.id)}
                            className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white"
                          >
                            ✓ Approve — mark Ready
                          </button>
                        </div>
                      ))}
                    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Ready</p>
                    {rooms
                      .filter((r) => r.status === "ready")
                      .map((r) => (
                        <div key={r.id} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                          <span className="text-sm font-semibold text-stone-700">Room {r.no}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Ready</span>
                        </div>
                      ))}
                  </>
                )}

                {/* OWNER */}
                {role === "owner" && (
                  <>
                    {ownerTab === "dashboard" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <Stat n={counts.ready} label="Rooms ready" color="bg-emerald-50 text-emerald-700" />
                          <Stat n={counts.toInspect} label="To inspect" color="bg-blue-50 text-blue-700" />
                          <Stat n={2} label="Open issues" color="bg-rose-50 text-rose-600" />
                          <Stat n={4} label="Present today" color="bg-amber-50 text-amber-700" />
                        </div>
                        <div className="mt-2 rounded-xl bg-amber-50 p-2.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-amber-600">⭐ Star performer</p>
                          <p className="text-sm font-bold text-stone-800">Jose</p>
                          <p className="text-[10px] text-stone-500">2 cleaned · 0 redos</p>
                        </div>
                        <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Room board</p>
                        <div className="space-y-1.5">
                          {rooms.map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                              <div>
                                <span className="text-sm font-semibold text-stone-700">Room {r.no}</span>
                                <span className="ml-1.5 text-[10px] text-stone-400">{r.assignee}</span>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status].cls}`}>
                                {STATUS_STYLE[r.status].label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {ownerTab === "reports" && (
                      <>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Present per day</p>
                        <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                          <div className="flex h-16 items-end gap-1">
                            {[2, 3, 4, 3, 4, 2, 4].map((v, i) => (
                              <div key={i} className="flex-1 rounded-t bg-amber-400" style={{ height: `${(v / 4) * 100}%` }} />
                            ))}
                          </div>
                          <div className="mt-1 flex justify-between text-[8px] text-stone-400">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                          </div>
                        </div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Issues</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          <Stat n={7} label="Total" color="bg-stone-100 text-stone-700" />
                          <Stat n={2} label="Open" color="bg-rose-50 text-rose-600" />
                          <Stat n={5} label="Fixed" color="bg-emerald-50 text-emerald-700" />
                        </div>
                        <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
                          <span className="text-[11px] text-stone-500">Avg time to fix</span>
                          <span className="text-xs font-bold text-stone-800">8h 28m</span>
                        </div>
                        <div className="mt-2 rounded-xl bg-emerald-50 py-2.5 text-center text-xs font-semibold text-emerald-700">
                          📥 Export to Excel
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* toast */}
                {toast && (
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-stone-900/90 px-3 py-2 text-center text-[11px] font-medium text-white">
                    {toast}
                  </div>
                )}
              </div>

              {/* Bottom nav */}
              <div className="flex border-t border-stone-200 bg-white">
                {role === "cleaner" && (
                  <>
                    <Nav icon="🛏" label="My Rooms" active />
                    <Nav icon="🔧" label="Issues" />
                    <Nav icon="⏰" label="Check In" />
                  </>
                )}
                {role === "supervisor" && (
                  <>
                    <Nav icon="🔍" label="Inspect" active />
                    <Nav icon="🔧" label="Issues" />
                    <Nav icon="⏰" label="Check In" />
                  </>
                )}
                {role === "owner" && (
                  <>
                    <button onClick={() => setOwnerTab("dashboard")} className="flex-1">
                      <Nav icon="📊" label="Dashboard" active={ownerTab === "dashboard"} asSpan />
                    </button>
                    <Nav icon="🔍" label="Inspect" />
                    <Nav icon="🔧" label="Issues" />
                    <button onClick={() => setOwnerTab("reports")} className="flex-1">
                      <Nav icon="📈" label="Reports" active={ownerTab === "reports"} asSpan />
                    </button>
                    <Nav icon="⏰" label="Check In" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-md text-amber-50">
            We&apos;ll set up your hotel — your rooms, your staff — the same day. Free to start.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-7 py-3 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
            >
              💬 Book a demo on WhatsApp
            </a>
            <Link
              href="/"
              className="rounded-full border border-white/60 px-7 py-3 text-base font-semibold text-white hover:bg-white/10"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${color}`}>
      <p className="text-lg font-bold leading-tight">{n}</p>
      <p className="text-[9px] leading-snug">{label}</p>
    </div>
  );
}

function Nav({ icon, label, active, asSpan }: { icon: string; label: string; active?: boolean; asSpan?: boolean }) {
  const cls = `flex flex-1 flex-col items-center gap-0.5 py-2 ${active ? "text-orange-500" : "text-stone-400"}`;
  const inner = (
    <>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[8px] font-medium leading-none">{label}</span>
    </>
  );
  if (asSpan) return <span className={cls.replace("flex-1 ", "")}>{inner}</span>;
  return <div className={cls}>{inner}</div>;
}
