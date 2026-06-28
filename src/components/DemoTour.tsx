"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/918220980134";

type RoomStatus = "cleaning" | "to_inspect" | "ready";
type Checks = { floor: boolean; bath: boolean; bed: boolean; bin: boolean; ac: boolean };
type Room = { id: string; no: string; assignee: string; status: RoomStatus; checks: Checks };
type Issue = {
  id: string;
  room: string;
  desc: string;
  cat: string;
  urgent: boolean;
  status: "open" | "fixed";
  by: string;
};
type Notif = { id: string; text: string; time: string; read: boolean };
type Role = "owner" | "supervisor" | "cleaner";

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

const INITIAL_ISSUES: Issue[] = [
  { id: "i1", room: "1003", desc: "Water bottles not available in the rooms", cat: "Other", urgent: true, status: "open", by: "Raj" },
  { id: "i2", room: "1001", desc: "Water tap inside the toilet is leaking", cat: "Plumbing", urgent: true, status: "open", by: "Raj" },
  { id: "i3", room: "1001", desc: "AC is not working", cat: "Electrical", urgent: false, status: "open", by: "Jose" },
  { id: "i4", room: "102", desc: "Door lock not working", cat: "Maintenance", urgent: false, status: "fixed", by: "Jose" },
  { id: "i5", room: "1001", desc: "Dust bins are damaged", cat: "Other", urgent: false, status: "fixed", by: "Jose" },
];

const INITIAL_PRESENT: { name: string; time: string; role: string }[] = [
  { name: "Suresh", time: "8:55 AM", role: "cleaner" },
  { name: "Lakshmi", time: "9:02 AM", role: "cleaner" },
  { name: "Jose", time: "9:10 AM", role: "cleaner" },
  { name: "Raj", time: "9:15 AM", role: "cleaner" },
];

const INITIAL_STAFF = [
  { name: "Suresh", role: "cleaner", lang: "தமிழ்", active: true },
  { name: "Lakshmi", role: "cleaner", lang: "தமிழ்", active: true },
  { name: "Jose", role: "cleaner", lang: "English", active: true },
  { name: "Raj", role: "cleaner", lang: "தமிழ்", active: true },
  { name: "Harish", role: "supervisor", lang: "English", active: true },
  { name: "Pooja", role: "cleaner", lang: "हिन्दी", active: false },
];

const STATUS_STYLE: Record<RoomStatus, { label: string; cls: string }> = {
  cleaning: { label: "Cleaning", cls: "bg-amber-100 text-amber-800" },
  to_inspect: { label: "To inspect", cls: "bg-blue-100 text-blue-700" },
  ready: { label: "Ready", cls: "bg-emerald-100 text-emerald-700" },
};

const ME: Record<Role, { name: string; label: string }> = {
  cleaner: { name: "Suresh", label: "Suresh · cleaner" },
  supervisor: { name: "Harish", label: "Harish · supervisor" },
  owner: { name: "Saratha", label: "Saratha · owner" },
};

const TABS: Record<Role, { key: string; icon: string; label: string }[]> = {
  cleaner: [
    { key: "rooms", icon: "🛏", label: "My Rooms" },
    { key: "issues", icon: "🔧", label: "Issues" },
    { key: "checkin", icon: "⏰", label: "Check In" },
  ],
  supervisor: [
    { key: "inspect", icon: "🔍", label: "Inspect" },
    { key: "issues", icon: "🔧", label: "Issues" },
    { key: "checkin", icon: "⏰", label: "Check In" },
  ],
  owner: [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "inspect", icon: "🔍", label: "Inspect" },
    { key: "issues", icon: "🔧", label: "Issues" },
    { key: "reports", icon: "📈", label: "Reports" },
    { key: "checkin", icon: "⏰", label: "Check In" },
  ],
};

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function DemoTour() {
  const [role, setRole] = useState<Role>("cleaner");
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [present, setPresent] = useState(INITIAL_PRESENT);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [activeRoomId, setActiveRoomId] = useState("r101");
  const [notifs, setNotifs] = useState<Notif[]>([
    { id: "n1", text: "⚠️ Urgent: Water tap leaking — Room 1001", time: "9:20 AM", read: false },
    { id: "n2", text: "✅ Room 103 marked ready by Raj", time: "9:05 AM", read: false },
    { id: "n3", text: "🕒 Raj checked in", time: "9:15 AM", read: true },
  ]);
  const [overlay, setOverlay] = useState<null | "notif" | "staff" | "hotel" | "report">(null);
  const [toast, setToast] = useState<string | null>(null);

  // report-issue form
  const [riRoom, setRiRoom] = useState("101");
  const [riDesc, setRiDesc] = useState("");
  const [riCat, setRiCat] = useState("Plumbing");
  const [riUrgent, setRiUrgent] = useState(false);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];
  const unread = notifs.filter((n) => !n.read).length;
  const counts = useMemo(
    () => ({
      ready: rooms.filter((r) => r.status === "ready").length,
      toInspect: rooms.filter((r) => r.status === "to_inspect").length,
      openIssues: issues.filter((i) => i.status === "open").length,
    }),
    [rooms, issues]
  );

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 1900);
  }
  function addNotif(text: string) {
    setNotifs((n) => [{ id: "n" + Date.now(), text, time: nowTime(), read: false }, ...n]);
  }
  function switchRole(r: Role) {
    setRole(r);
    setTab(TABS[r][0].key);
    setOverlay(null);
  }
  function toggleCheck(id: string, key: keyof Checks) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, checks: { ...r.checks, [key]: !r.checks[key] } } : r)));
  }
  function markCleaned(id: string) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "to_inspect" } : r)));
    addNotif(`🧹 Room ${rooms.find((r) => r.id === id)?.no} marked cleaned — ready to inspect`);
    flash("Room marked cleaned ✓ — supervisor notified");
  }
  function approve(id: string) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "ready" } : r)));
    addNotif(`✅ Room ${rooms.find((r) => r.id === id)?.no} passed inspection — Ready`);
    flash("Inspection passed → Room ready ✓");
  }
  function markFixed(id: string) {
    const it = issues.find((i) => i.id === id);
    setIssues((is) => is.map((i) => (i.id === id ? { ...i, status: "fixed" } : i)));
    addNotif(`✅ Issue fixed — Room ${it?.room}: ${it?.desc}`);
    flash("Issue marked fixed ✓");
  }
  function submitIssue() {
    if (!riDesc.trim()) return flash("Please describe the issue");
    const ni: Issue = { id: "i" + Date.now(), room: riRoom, desc: riDesc.trim(), cat: riCat, urgent: riUrgent, status: "open", by: ME[role].name };
    setIssues((is) => [ni, ...is]);
    addNotif(`${riUrgent ? "⚠️ Urgent: " : "🔧 "}New issue — Room ${riRoom}: ${riDesc.trim()}`);
    setRiDesc("");
    setRiUrgent(false);
    setOverlay(null);
    setTab("issues");
    flash("Issue reported ✓");
  }
  function checkIn() {
    const me = ME[role].name;
    if (present.some((p) => p.name === me)) return flash("Already checked in today");
    setPresent((p) => [...p, { name: me, time: nowTime(), role }]);
    addNotif(`🕒 ${me} checked in`);
    flash(`Checked in ✓ — ${nowTime()}`);
  }
  function openNotif() {
    setOverlay("notif");
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
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
          <a href={WA} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50">
            Book a demo
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        {/* Left */}
        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">🏨 Demo Hotel · Grand Palace Hotel</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-900 md:text-4xl">Try the full app — right here, no login.</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-stone-600">
            A real, working demo with sample data. Switch roles and explore <b>every</b> screen —
            rooms, issues, notifications, check-in, reports, staff and hotel profile.
          </p>

          <p className="mt-7 text-sm font-semibold text-stone-500">See it as a…</p>
          <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            {([{ k: "cleaner", l: "🧹 Cleaner" }, { k: "supervisor", l: "🔍 Supervisor" }, { k: "owner", l: "📊 Owner" }] as { k: Role; l: string }[]).map((r) => (
              <button key={r.k} onClick={() => switchRole(r.k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${role === r.k ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>
                {r.l}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
            <p className="font-semibold text-stone-800">What you can try 👇</p>
            <ul className="mt-2 space-y-1.5">
              <li>• Tap the <b>bottom tabs</b> to move between screens.</li>
              <li>• Open the 🔔 <b>bell</b> for live notifications.</li>
              <li>• In <b>Issues</b>: report a new issue or mark one fixed.</li>
              <li>• In <b>Check In</b>: check in and see who&apos;s present.</li>
              {role === "cleaner" && <li>• In <b>My Rooms</b>: tick the checklist → Mark Cleaned.</li>}
              {role === "supervisor" && <li>• In <b>Inspect</b>: approve a cleaned room.</li>}
              {role === "owner" && <li>• Open 👥 <b>Staff</b> and 🏨 <b>Hotel</b> from the dashboard.</li>}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={WA} target="_blank" rel="noreferrer" className="rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700">Get this for my hotel</a>
            <Link href="/login" className="rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-700 hover:bg-stone-100">Staff login</Link>
          </div>
        </div>

        {/* Phone */}
        <div className="flex justify-center md:sticky md:top-24">
          <div className="relative w-[300px] rounded-[2.4rem] bg-stone-900 p-2 shadow-2xl">
            <div className="flex h-[580px] flex-col overflow-hidden rounded-[2rem] bg-stone-50">
              {/* Top bar */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">✨ Xeltrix Sparkle</p>
                    <p className="text-[10px] text-orange-100">{ME[role].label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role === "owner" && (
                      <>
                        <button onClick={() => setOverlay("staff")} className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold" title="Staff">👥</button>
                        <button onClick={() => setOverlay("hotel")} className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold" title="Hotel">🏨</button>
                      </>
                    )}
                    <button onClick={openNotif} className="relative rounded-full bg-white/20 px-2 py-1 text-[12px] font-semibold" title="Notifications">
                      🔔
                      {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">{unread}</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="relative flex-1 overflow-y-auto p-3">
                {/* CLEANER · ROOMS */}
                {role === "cleaner" && tab === "rooms" && (
                  <>
                    <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                      {rooms.map((r) => (
                        <button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${r.id === activeRoomId ? "bg-amber-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{r.no}</button>
                      ))}
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-stone-800">Room {activeRoom.no}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[activeRoom.status].cls}`}>{STATUS_STYLE[activeRoom.status].label}</span>
                    </div>
                    <div className="rounded-xl bg-white shadow-sm">
                      {CHECK_LABELS.map(({ key, label }) => (
                        <button key={key} onClick={() => toggleCheck(activeRoom.id, key)} className="flex w-full items-center justify-between border-b border-stone-100 px-3 py-3 last:border-0">
                          <span className="text-xs text-stone-700">{label}</span>
                          <span className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${activeRoom.checks[key] ? "bg-emerald-500" : "bg-stone-300"}`}>
                            <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${activeRoom.checks[key] ? "translate-x-6" : "translate-x-1"}`} />
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2.5 text-xs font-medium text-amber-700">📷 Add photos</div>
                    <button disabled={!allChecked || activeRoom.status !== "cleaning"} onClick={() => markCleaned(activeRoom.id)} className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-40">
                      {activeRoom.status === "to_inspect" ? "Sent for inspection ✓" : allChecked ? "Mark Cleaned" : "Finish all items to submit"}
                    </button>
                    <button onClick={() => setOverlay("report")} className="mt-1.5 w-full rounded-xl bg-pink-50 py-2 text-xs font-semibold text-pink-600">🔧 Report Issue</button>
                  </>
                )}

                {/* INSPECT (supervisor + owner) */}
                {tab === "inspect" && (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Awaiting inspection</p>
                    {rooms.filter((r) => r.status === "to_inspect").length === 0 && <p className="rounded-xl bg-white p-4 text-center text-xs text-stone-400 shadow-sm">All caught up 🎉</p>}
                    {rooms.filter((r) => r.status === "to_inspect").map((r) => (
                      <div key={r.id} className="mb-2 rounded-xl bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-stone-800">Room {r.no}</span>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">To inspect</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-stone-500">Cleaned by {r.assignee}</p>
                        <button onClick={() => approve(r.id)} className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white">✓ Approve — mark Ready</button>
                      </div>
                    ))}
                    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Ready</p>
                    {rooms.filter((r) => r.status === "ready").map((r) => (
                      <div key={r.id} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                        <span className="text-sm font-semibold text-stone-700">Room {r.no}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Ready</span>
                      </div>
                    ))}
                  </>
                )}

                {/* ISSUES (all roles) */}
                {tab === "issues" && (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Maintenance issues</span>
                      <button onClick={() => setOverlay("report")} className="rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white">+ Report</button>
                    </div>
                    {issues.map((i) => (
                      <div key={i.id} className="mb-2 rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-1 flex items-center gap-1.5">
                          {i.urgent && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">⚠ URGENT</span>}
                          <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[8px] font-semibold text-stone-600">{i.cat}</span>
                          <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${i.status === "open" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>{i.status === "open" ? "Open" : "Fixed"}</span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">{i.desc}</p>
                        <p className="mt-0.5 text-[10px] text-stone-400">Room {i.room} · reported by {i.by}</p>
                        {i.status === "open" && (
                          <button onClick={() => markFixed(i.id)} className="mt-2 w-full rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white">✓ Mark Fixed</button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* CHECK IN (all roles) */}
                {tab === "checkin" && (
                  <>
                    <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                      <p className="text-[11px] text-stone-400">Today · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
                      {role !== "owner" ? (
                        <button onClick={checkIn} className="mt-3 w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white">🕒 Check in now</button>
                      ) : (
                        <p className="mt-2 text-xs text-stone-500">{present.length} staff present today</p>
                      )}
                    </div>
                    <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Present today ({present.length})</p>
                    {present.map((p) => (
                      <div key={p.name} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">{p.name[0]}</span>
                          <div><p className="text-xs font-semibold text-stone-700">{p.name}</p><p className="text-[9px] text-stone-400">{p.role}</p></div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-600">{p.time}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* OWNER · DASHBOARD */}
                {tab === "dashboard" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Stat n={counts.ready} label="Rooms ready" color="bg-emerald-50 text-emerald-700" />
                      <Stat n={counts.toInspect} label="To inspect" color="bg-blue-50 text-blue-700" />
                      <Stat n={counts.openIssues} label="Open issues" color="bg-rose-50 text-rose-600" />
                      <Stat n={present.length} label="Present today" color="bg-amber-50 text-amber-700" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setOverlay("staff")} className="flex-1 rounded-xl bg-white py-2 text-[11px] font-semibold text-stone-700 shadow-sm">👥 Staff</button>
                      <button onClick={() => setOverlay("hotel")} className="flex-1 rounded-xl bg-white py-2 text-[11px] font-semibold text-stone-700 shadow-sm">🏨 Hotel</button>
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
                          <div><span className="text-sm font-semibold text-stone-700">Room {r.no}</span><span className="ml-1.5 text-[10px] text-stone-400">{r.assignee}</span></div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status].cls}`}>{STATUS_STYLE[r.status].label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* OWNER · REPORTS */}
                {tab === "reports" && (
                  <>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Present per day</p>
                    <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                      <div className="flex h-16 items-end gap-1">{[2, 3, 4, 3, 4, 2, 4].map((v, i) => (<div key={i} className="flex-1 rounded-t bg-amber-400" style={{ height: `${(v / 4) * 100}%` }} />))}</div>
                      <div className="mt-1 flex justify-between text-[8px] text-stone-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                    </div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Issues</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Stat n={issues.length} label="Total" color="bg-stone-100 text-stone-700" />
                      <Stat n={issues.filter((i) => i.status === "open").length} label="Open" color="bg-rose-50 text-rose-600" />
                      <Stat n={issues.filter((i) => i.status === "fixed").length} label="Fixed" color="bg-emerald-50 text-emerald-700" />
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm"><span className="text-[11px] text-stone-500">Avg time to fix</span><span className="text-xs font-bold text-stone-800">8h 28m</span></div>
                    <div className="mt-2 rounded-xl bg-emerald-50 py-2.5 text-center text-xs font-semibold text-emerald-700">📥 Export to Excel</div>
                  </>
                )}

                {/* OVERLAYS */}
                {overlay && (
                  <div className="absolute inset-0 z-10 flex flex-col bg-stone-50">
                    <div className="flex items-center justify-between border-b border-stone-200 bg-white px-3 py-2.5">
                      <span className="text-sm font-bold text-stone-800">
                        {overlay === "notif" && "🔔 Notifications"}
                        {overlay === "staff" && "👥 Staff"}
                        {overlay === "hotel" && "🏨 Hotel profile"}
                        {overlay === "report" && "🔧 Report an issue"}
                      </span>
                      <button onClick={() => setOverlay(null)} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      {overlay === "notif" && notifs.map((n) => (
                        <div key={n.id} className="mb-1.5 rounded-xl bg-white p-2.5 shadow-sm">
                          <p className="text-xs text-stone-700">{n.text}</p>
                          <p className="mt-0.5 text-[9px] text-stone-400">{n.time}</p>
                        </div>
                      ))}

                      {overlay === "staff" && (
                        <>
                          <button className="mb-2 w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white">+ Add staff</button>
                          {staff.map((s) => (
                            <div key={s.name} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                              <div><p className="text-xs font-semibold text-stone-700">{s.name}</p><p className="text-[9px] text-stone-400">{s.role} · {s.lang}</p></div>
                              <button onClick={() => setStaff((st) => st.map((x) => x.name === s.name ? { ...x, active: !x.active } : x))} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>{s.active ? "Active" : "Inactive"}</button>
                            </div>
                          ))}
                        </>
                      )}

                      {overlay === "hotel" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                            <Image src="/icon-192.png" alt="" width={44} height={44} className="rounded-lg" />
                            <div><p className="text-sm font-bold text-stone-800">Grand Palace Hotel</p><p className="text-[10px] text-stone-400">5 rooms · 6 staff</p></div>
                          </div>
                          <div className="rounded-xl bg-white p-3 text-xs text-stone-600 shadow-sm">
                            <p className="font-semibold text-stone-700">Address</p>
                            <p className="mt-0.5">123 Race Course Road, Coimbatore, TN 641018</p>
                            <p className="mt-2 font-semibold text-amber-700">📍 View on Google Maps ↗</p>
                          </div>
                          <div className="rounded-xl bg-white p-3 text-xs shadow-sm">
                            <p className="font-semibold text-stone-700">Language</p>
                            <div className="mt-1.5 flex gap-1.5">
                              <span className="rounded-full bg-amber-600 px-2.5 py-1 text-[10px] font-semibold text-white">English</span>
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600">தமிழ்</span>
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600">हिन्दी</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {overlay === "report" && (
                        <div className="space-y-3">
                          <div>
                            <p className="mb-1 text-[11px] font-semibold text-stone-600">Room</p>
                            <div className="flex flex-wrap gap-1.5">
                              {rooms.map((r) => (
                                <button key={r.id} onClick={() => setRiRoom(r.no)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riRoom === r.no ? "bg-amber-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{r.no}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold text-stone-600">Category</p>
                            <div className="flex flex-wrap gap-1.5">
                              {["Plumbing", "Electrical", "Maintenance", "Other"].map((c) => (
                                <button key={c} onClick={() => setRiCat(c)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riCat === c ? "bg-stone-800 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{c}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold text-stone-600">Description</p>
                            <textarea value={riDesc} onChange={(e) => setRiDesc(e.target.value)} rows={2} placeholder="e.g. Wash basin is blocked" className="w-full rounded-xl border border-stone-300 p-2 text-xs" />
                          </div>
                          <button onClick={() => setRiUrgent((u) => !u)} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm">
                            ⚠️ Mark as Urgent
                            <span className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${riUrgent ? "bg-rose-500" : "bg-stone-300"}`}><span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${riUrgent ? "translate-x-6" : "translate-x-1"}`} /></span>
                          </button>
                          <div className="flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2 text-[11px] font-medium text-amber-700">📷 Add photo / 🎤 voice note</div>
                          <button onClick={submitIssue} className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white">Submit issue</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {toast && <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-xl bg-stone-900/90 px-3 py-2 text-center text-[11px] font-medium text-white">{toast}</div>}
              </div>

              {/* Bottom nav */}
              <div className="flex border-t border-stone-200 bg-white">
                {TABS[role].map((t) => {
                  const active = tab === t.key && !overlay;
                  return (
                    <button key={t.key} onClick={() => { setTab(t.key); setOverlay(null); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${active ? "text-orange-500" : "text-stone-400"}`}>
                      <span className="text-base leading-none">{t.icon}</span>
                      <span className="text-[8px] font-medium leading-none">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-md text-amber-50">We&apos;ll set up your hotel — your rooms, your staff — the same day. Free to start.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={WA} target="_blank" rel="noreferrer" className="rounded-full bg-white px-7 py-3 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50">💬 Book a demo on WhatsApp</a>
            <Link href="/" className="rounded-full border border-white/60 px-7 py-3 text-base font-semibold text-white hover:bg-white/10">← Back to home</Link>
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
