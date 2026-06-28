"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/918220980134";

type Lang = "en" | "ta" | "hi";
type RoomStatus = "cleaning" | "to_inspect" | "ready";
type Checks = { floor: boolean; bath: boolean; bed: boolean; bin: boolean; ac: boolean };
type Room = { id: string; no: string; assignee: string; status: RoomStatus; checks: Checks };
type Issue = { id: string; room: string; desc: { en: string; ta: string; hi: string }; cat: string; urgent: boolean; status: "open" | "fixed"; by: string };
type Notif = { id: string; text: string; time: string; read: boolean };
type Role = "owner" | "supervisor" | "cleaner";

// ── tiny i18n dictionary for the in-phone app ──
const D: Record<string, Record<Lang, string>> = {
  myRooms: { en: "My Rooms", ta: "என் அறைகள்", hi: "मेरे कमरे" },
  issues: { en: "Issues", ta: "சிக்கல்கள்", hi: "समस्याएँ" },
  checkin: { en: "Check In", ta: "வருகை", hi: "चेक इन" },
  inspect: { en: "Inspect", ta: "சோதனை", hi: "निरीक्षण" },
  dashboard: { en: "Dashboard", ta: "டாஷ்போர்டு", hi: "डैशबोर्ड" },
  reports: { en: "Reports", ta: "அறிக்கைகள்", hi: "रिपोर्ट" },
  cleaning: { en: "Cleaning", ta: "சுத்தம் நடக்கிறது", hi: "सफाई जारी" },
  to_inspect: { en: "To inspect", ta: "சோதனைக்கு", hi: "निरीक्षण हेतु" },
  ready: { en: "Ready", ta: "தயார்", hi: "तैयार" },
  floor: { en: "Floor cleaned", ta: "தரை சுத்தம்", hi: "फर्श साफ" },
  bath: { en: "Bathroom cleaned", ta: "குளியலறை சுத்தம்", hi: "बाथरूम साफ" },
  bed: { en: "Bed arranged", ta: "படுக்கை ஒழுங்கு", hi: "बिस्तर व्यवस्थित" },
  bin: { en: "Bin emptied", ta: "குப்பை காலி", hi: "कूड़ादान खाली" },
  ac: { en: "AC working", ta: "ஏசி வேலை செய்கிறது", hi: "एसी चालू" },
  room: { en: "Room", ta: "அறை", hi: "कमरा" },
  addPhotos: { en: "📷 Add photos", ta: "📷 புகைப்படம் சேர்", hi: "📷 फोटो जोड़ें" },
  markCleaned: { en: "Mark Cleaned", ta: "சுத்தம் முடிந்தது", hi: "सफाई पूर्ण" },
  finishAll: { en: "Finish all items to submit", ta: "அனைத்தையும் முடிக்கவும்", hi: "सभी पूरा करें" },
  sentInspect: { en: "Sent for inspection ✓", ta: "சோதனைக்கு அனுப்பப்பட்டது ✓", hi: "निरीक्षण हेतु भेजा ✓" },
  reportIssue: { en: "🔧 Report Issue", ta: "🔧 சிக்கலைப் பதிவு செய்", hi: "🔧 समस्या दर्ज करें" },
  awaiting: { en: "Awaiting inspection", ta: "சோதனைக்கு காத்திருக்கிறது", hi: "निरीक्षण प्रतीक्षित" },
  caughtUp: { en: "All caught up 🎉", ta: "அனைத்தும் முடிந்தது 🎉", hi: "सब पूरा 🎉" },
  cleanedBy: { en: "Cleaned by", ta: "சுத்தம் செய்தவர்", hi: "सफाई की" },
  approve: { en: "✓ Approve — mark Ready", ta: "✓ ஒப்புதல் — தயார்", hi: "✓ स्वीकृत — तैयार" },
  maintenanceIssues: { en: "Maintenance issues", ta: "பராமரிப்பு சிக்கல்கள்", hi: "रखरखाव समस्याएँ" },
  reportBtn: { en: "+ Report", ta: "+ பதிவு", hi: "+ दर्ज" },
  urgent: { en: "URGENT", ta: "அவசரம்", hi: "अत्यावश्यक" },
  open: { en: "Open", ta: "திறந்த", hi: "खुला" },
  fixed: { en: "Fixed", ta: "சரி", hi: "ठीक" },
  reportedBy: { en: "reported by", ta: "பதிவு செய்தவர்", hi: "दर्ज" },
  markFixed: { en: "✓ Mark Fixed", ta: "✓ சரி செய்யப்பட்டது", hi: "✓ ठीक हुआ" },
  checkInNow: { en: "🕒 Check in now", ta: "🕒 இப்போது வருகை பதிவு", hi: "🕒 अभी चेक इन करें" },
  presentToday: { en: "Present today", ta: "இன்று வந்தவர்கள்", hi: "आज उपस्थित" },
  staffPresent: { en: "staff present today", ta: "பேர் இன்று வந்துள்ளனர்", hi: "कर्मचारी आज उपस्थित" },
  roomsReady: { en: "Rooms ready", ta: "தயார் அறைகள்", hi: "तैयार कमरे" },
  toInspectStat: { en: "To inspect", ta: "சோதனைக்கு", hi: "निरीक्षण हेतु" },
  openIssues: { en: "Open issues", ta: "திறந்த சிக்கல்கள்", hi: "खुली समस्याएँ" },
  star: { en: "⭐ Star performer", ta: "⭐ சிறந்த ஊழியர்", hi: "⭐ श्रेष्ठ कर्मी" },
  cleanedRedos: { en: "2 cleaned · 0 redos", ta: "2 சுத்தம் · 0 மறுவேலை", hi: "2 साफ · 0 दोबारा" },
  roomBoard: { en: "Room board", ta: "அறை பலகை", hi: "कमरा बोर्ड" },
  staff: { en: "👥 Staff", ta: "👥 ஊழியர்", hi: "👥 कर्मचारी" },
  hotel: { en: "🏨 Hotel", ta: "🏨 ஹோட்டல்", hi: "🏨 होटल" },
  presentPerDay: { en: "Present per day", ta: "நாள் வாரியாக வருகை", hi: "प्रति दिन उपस्थिति" },
  total: { en: "Total", ta: "மொத்தம்", hi: "कुल" },
  avgFix: { en: "Avg time to fix", ta: "சராசரி சரிசெய்யும் நேரம்", hi: "औसत ठीक करने का समय" },
  exportExcel: { en: "📥 Export to Excel", ta: "📥 Excel-ஆக பதிவிறக்கு", hi: "📥 Excel में निर्यात" },
  notifications: { en: "🔔 Notifications", ta: "🔔 அறிவிப்புகள்", hi: "🔔 सूचनाएँ" },
  staffTitle: { en: "👥 Staff", ta: "👥 ஊழியர்கள்", hi: "👥 कर्मचारी" },
  hotelProfile: { en: "🏨 Hotel profile", ta: "🏨 ஹோட்டல் விவரம்", hi: "🏨 होटल प्रोफ़ाइल" },
  reportAnIssue: { en: "🔧 Report an issue", ta: "🔧 சிக்கலைப் பதிவு செய்", hi: "🔧 समस्या दर्ज करें" },
  addStaff: { en: "+ Add staff", ta: "+ ஊழியரைச் சேர்", hi: "+ कर्मचारी जोड़ें" },
  active: { en: "Active", ta: "செயலில்", hi: "सक्रिय" },
  inactive: { en: "Inactive", ta: "செயலில் இல்லை", hi: "निष्क्रिय" },
  category: { en: "Category", ta: "வகை", hi: "श्रेणी" },
  description: { en: "Description", ta: "விவரம்", hi: "विवरण" },
  markUrgent: { en: "⚠️ Mark as Urgent", ta: "⚠️ அவசரம் எனக் குறி", hi: "⚠️ अत्यावश्यक चिह्नित करें" },
  addMedia: { en: "📷 Add photo / 🎤 voice note", ta: "📷 படம் / 🎤 குரல்", hi: "📷 फोटो / 🎤 वॉइस" },
  submitIssue: { en: "Submit issue", ta: "சிக்கலை சமர்ப்பி", hi: "समस्या सबमिट करें" },
  address: { en: "Address", ta: "முகவரி", hi: "पता" },
  viewMap: { en: "📍 View on Google Maps ↗", ta: "📍 Google Map-ல் பார் ↗", hi: "📍 Google Maps पर देखें ↗" },
  language: { en: "Language", ta: "மொழி", hi: "भाषा" },
  roomsStaff: { en: "5 rooms · 6 staff", ta: "5 அறைகள் · 6 ஊழியர்", hi: "5 कमरे · 6 कर्मचारी" },
  role_cleaner: { en: "cleaner", ta: "சுத்தம் செய்பவர்", hi: "सफाईकर्मी" },
  role_supervisor: { en: "supervisor", ta: "மேற்பார்வையாளர்", hi: "पर्यवेक्षक" },
  role_owner: { en: "owner", ta: "உரிமையாளர்", hi: "मालिक" },
};

const CHECK_KEYS: (keyof Checks)[] = ["floor", "bath", "bed", "bin", "ac"];

const INITIAL_ROOMS: Room[] = [
  { id: "r101", no: "101", assignee: "Suresh", status: "cleaning", checks: { floor: true, bath: true, bed: false, bin: true, ac: false } },
  { id: "r102", no: "102", assignee: "Lakshmi", status: "to_inspect", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
  { id: "r103", no: "103", assignee: "Raj", status: "ready", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
  { id: "r104", no: "104", assignee: "Pooja", status: "cleaning", checks: { floor: false, bath: false, bed: false, bin: false, ac: false } },
  { id: "r105", no: "105", assignee: "Muthu", status: "ready", checks: { floor: true, bath: true, bed: true, bin: true, ac: true } },
];

const INITIAL_ISSUES: Issue[] = [
  { id: "i1", room: "1003", desc: { en: "Water bottles not available in the rooms", ta: "அறைகளில் தண்ணீர் பாட்டில் இல்லை", hi: "कमरों में पानी की बोतलें नहीं हैं" }, cat: "Other", urgent: true, status: "open", by: "Raj" },
  { id: "i2", room: "1001", desc: { en: "Water tap inside the toilet is leaking", ta: "கழிப்பறை குழாய் கசிகிறது", hi: "टॉयलेट का नल लीक हो रहा है" }, cat: "Plumbing", urgent: true, status: "open", by: "Raj" },
  { id: "i3", room: "1001", desc: { en: "AC is not working", ta: "ஏசி வேலை செய்யவில்லை", hi: "एसी काम नहीं कर रहा" }, cat: "Electrical", urgent: false, status: "open", by: "Jose" },
  { id: "i4", room: "102", desc: { en: "Door lock not working", ta: "கதவு பூட்டு வேலை செய்யவில்லை", hi: "दरवाज़े का ताला खराब है" }, cat: "Maintenance", urgent: false, status: "fixed", by: "Jose" },
  { id: "i5", room: "1001", desc: { en: "Dust bins are damaged", ta: "குப்பைத் தொட்டிகள் சேதம்", hi: "कूड़ेदान क्षतिग्रस्त हैं" }, cat: "Other", urgent: false, status: "fixed", by: "Jose" },
];

const INITIAL_PRESENT = [
  { name: "Suresh", time: "8:55 AM", role: "cleaner" as Role },
  { name: "Lakshmi", time: "9:02 AM", role: "cleaner" as Role },
  { name: "Jose", time: "9:10 AM", role: "cleaner" as Role },
  { name: "Raj", time: "9:15 AM", role: "cleaner" as Role },
];

const INITIAL_STAFF = [
  { name: "Suresh", role: "cleaner" as Role, lang: "தமிழ்", active: true },
  { name: "Lakshmi", role: "cleaner" as Role, lang: "தமிழ்", active: true },
  { name: "Jose", role: "cleaner" as Role, lang: "English", active: true },
  { name: "Raj", role: "cleaner" as Role, lang: "தமிழ்", active: true },
  { name: "Harish", role: "supervisor" as Role, lang: "English", active: true },
  { name: "Pooja", role: "cleaner" as Role, lang: "हिन्दी", active: false },
];

const STATUS_CLS: Record<RoomStatus, string> = {
  cleaning: "bg-amber-100 text-amber-800",
  to_inspect: "bg-blue-100 text-blue-700",
  ready: "bg-emerald-100 text-emerald-700",
};

const ME: Record<Role, string> = { cleaner: "Suresh", supervisor: "Harish", owner: "Saratha" };
const TABS: Record<Role, { key: string; icon: string }[]> = {
  cleaner: [{ key: "rooms", icon: "🛏" }, { key: "issues", icon: "🔧" }, { key: "checkin", icon: "⏰" }],
  supervisor: [{ key: "inspect", icon: "🔍" }, { key: "issues", icon: "🔧" }, { key: "checkin", icon: "⏰" }],
  owner: [{ key: "dashboard", icon: "📊" }, { key: "inspect", icon: "🔍" }, { key: "issues", icon: "🔧" }, { key: "reports", icon: "📈" }, { key: "checkin", icon: "⏰" }],
};
const TAB_LABEL: Record<string, string> = { rooms: "myRooms", issues: "issues", checkin: "checkin", inspect: "inspect", dashboard: "dashboard", reports: "reports" };

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function DemoTour() {
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role>("cleaner");
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [present, setPresent] = useState(INITIAL_PRESENT);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [activeRoomId, setActiveRoomId] = useState("r101");
  const [notifs, setNotifs] = useState<Notif[]>([
    { id: "n1", text: "⚠️ Water tap leaking — Room 1001", time: "9:20 AM", read: false },
    { id: "n2", text: "✅ Room 103 marked ready by Raj", time: "9:05 AM", read: false },
    { id: "n3", text: "🕒 Raj checked in", time: "9:15 AM", read: true },
  ]);
  const [overlay, setOverlay] = useState<null | "notif" | "staff" | "hotel" | "report">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [riRoom, setRiRoom] = useState("101");
  const [riDesc, setRiDesc] = useState("");
  const [riCat, setRiCat] = useState("Plumbing");
  const [riUrgent, setRiUrgent] = useState(false);

  const t = (k: string) => D[k]?.[lang] ?? k;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0];
  const unread = notifs.filter((n) => !n.read).length;
  const counts = useMemo(() => ({
    ready: rooms.filter((r) => r.status === "ready").length,
    toInspect: rooms.filter((r) => r.status === "to_inspect").length,
    openIssues: issues.filter((i) => i.status === "open").length,
  }), [rooms, issues]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 1900); }
  function addNotif(text: string) { setNotifs((n) => [{ id: "n" + Date.now(), text, time: nowTime(), read: false }, ...n]); }
  function switchRole(r: Role) { setRole(r); setTab(TABS[r][0].key); setOverlay(null); }
  function toggleCheck(id: string, key: keyof Checks) { setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, checks: { ...r.checks, [key]: !r.checks[key] } } : r))); }
  function markCleaned(id: string) { setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "to_inspect" } : r))); addNotif(`🧹 Room ${rooms.find((r) => r.id === id)?.no} cleaned — to inspect`); flash("✓"); }
  function approve(id: string) { setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "ready" } : r))); addNotif(`✅ Room ${rooms.find((r) => r.id === id)?.no} ready`); flash("✓"); }
  function markFixed(id: string) { const it = issues.find((i) => i.id === id); setIssues((is) => is.map((i) => (i.id === id ? { ...i, status: "fixed" } : i))); addNotif(`✅ Fixed — Room ${it?.room}`); flash("✓"); }
  function submitIssue() {
    if (!riDesc.trim()) return flash("…");
    setIssues((is) => [{ id: "i" + Date.now(), room: riRoom, desc: { en: riDesc.trim(), ta: riDesc.trim(), hi: riDesc.trim() }, cat: riCat, urgent: riUrgent, status: "open", by: ME[role] }, ...is]);
    addNotif(`${riUrgent ? "⚠️ " : "🔧 "}New issue — Room ${riRoom}`);
    setRiDesc(""); setRiUrgent(false); setOverlay(null); setTab("issues"); flash("✓");
  }
  function checkIn() { const me = ME[role]; if (present.some((p) => p.name === me)) return flash("✓"); setPresent((p) => [...p, { name: me, time: nowTime(), role }]); addNotif(`🕒 ${me} checked in`); flash("✓"); }
  function openNotif() { setOverlay("notif"); setNotifs((n) => n.map((x) => ({ ...x, read: true }))); }

  const allChecked = Object.values(activeRoom.checks).every(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-50 border-b border-orange-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix Sparkle" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">Xeltrix Sparkle · Live Demo</span>
          </Link>
          <a href={WA} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50">Book a demo</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">🏨 Demo Hotel · Grand Palace Hotel</span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-900 md:text-4xl">Try the full app — right here, no login.</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-stone-600">A real, working demo with sample data. Switch roles, switch language (English / தமிழ் / हिन्दी), and explore every screen.</p>

          <p className="mt-7 text-sm font-semibold text-stone-500">See it as a…</p>
          <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            {([{ k: "cleaner", l: "🧹 Cleaner" }, { k: "supervisor", l: "🔍 Supervisor" }, { k: "owner", l: "📊 Owner" }] as { k: Role; l: string }[]).map((r) => (
              <button key={r.k} onClick={() => switchRole(r.k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${role === r.k ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>{r.l}</button>
            ))}
          </div>

          <p className="mt-5 text-sm font-semibold text-stone-500">App language</p>
          <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            {([{ k: "en", l: "English" }, { k: "ta", l: "தமிழ்" }, { k: "hi", l: "हिन्दी" }] as { k: Lang; l: string }[]).map((l) => (
              <button key={l.k} onClick={() => setLang(l.k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${lang === l.k ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>{l.l}</button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
            <p className="font-semibold text-stone-800">What you can try 👇</p>
            <ul className="mt-2 space-y-1.5">
              <li>• Switch <b>language</b> above — the whole app changes live.</li>
              <li>• Tap the <b>bottom tabs</b> and the 🔔 <b>bell</b>.</li>
              <li>• In <b>Issues</b>: report a new one or mark fixed.</li>
              <li>• In <b>Check In</b>: check in &amp; see who&apos;s present.</li>
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
            <div className="flex h-[600px] flex-col overflow-hidden rounded-[2rem] bg-stone-50">
              {/* Top bar */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">✨ Xeltrix Sparkle</p>
                    <p className="text-[10px] text-orange-100">{ME[role]} · {t("role_" + role)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role === "owner" && (
                      <>
                        <button onClick={() => setOverlay("staff")} className="rounded-full bg-white/20 px-2 py-1 text-[11px]" title="Staff">👥</button>
                        <button onClick={() => setOverlay("hotel")} className="rounded-full bg-white/20 px-2 py-1 text-[11px]" title="Hotel">🏨</button>
                      </>
                    )}
                    <button onClick={openNotif} className="relative rounded-full bg-white/20 px-2 py-1 text-[12px]" title="Notifications">🔔{unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">{unread}</span>}</button>
                  </div>
                </div>
              </div>

              {/* In-app language strip */}
              <div className="flex items-center justify-center gap-1 border-b border-stone-200 bg-white py-1.5">
                {([{ k: "en", l: "English" }, { k: "ta", l: "தமிழ்" }, { k: "hi", l: "हिन्दी" }] as { k: Lang; l: string }[]).map((l) => (
                  <button key={l.k} onClick={() => setLang(l.k)} className={`rounded-full px-3 py-0.5 text-[10px] font-semibold ${lang === l.k ? "bg-amber-600 text-white" : "text-stone-500"}`}>{l.l}</button>
                ))}
              </div>

              {/* Body */}
              <div className="relative flex-1 overflow-y-auto p-3">
                {role === "cleaner" && tab === "rooms" && (
                  <>
                    <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                      {rooms.map((r) => (<button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${r.id === activeRoomId ? "bg-amber-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{r.no}</button>))}
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-stone-800">{t("room")} {activeRoom.no}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLS[activeRoom.status]}`}>{t(activeRoom.status)}</span>
                    </div>
                    <div className="rounded-xl bg-white shadow-sm">
                      {CHECK_KEYS.map((key) => (
                        <button key={key} onClick={() => toggleCheck(activeRoom.id, key)} className="flex w-full items-center justify-between border-b border-stone-100 px-3 py-3 last:border-0">
                          <span className="text-xs text-stone-700">{t(key)}</span>
                          <span className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${activeRoom.checks[key] ? "bg-emerald-500" : "bg-stone-300"}`}><span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${activeRoom.checks[key] ? "translate-x-6" : "translate-x-1"}`} /></span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2.5 text-xs font-medium text-amber-700">{t("addPhotos")}</div>
                    <button disabled={!allChecked || activeRoom.status !== "cleaning"} onClick={() => markCleaned(activeRoom.id)} className="mt-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-40">{activeRoom.status === "to_inspect" ? t("sentInspect") : allChecked ? t("markCleaned") : t("finishAll")}</button>
                    <button onClick={() => setOverlay("report")} className="mt-1.5 w-full rounded-xl bg-pink-50 py-2 text-xs font-semibold text-pink-600">{t("reportIssue")}</button>
                  </>
                )}

                {tab === "inspect" && (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("awaiting")}</p>
                    {rooms.filter((r) => r.status === "to_inspect").length === 0 && <p className="rounded-xl bg-white p-4 text-center text-xs text-stone-400 shadow-sm">{t("caughtUp")}</p>}
                    {rooms.filter((r) => r.status === "to_inspect").map((r) => (
                      <div key={r.id} className="mb-2 rounded-xl bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between"><span className="text-sm font-bold text-stone-800">{t("room")} {r.no}</span><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{t("to_inspect")}</span></div>
                        <p className="mt-0.5 text-[11px] text-stone-500">{t("cleanedBy")} {r.assignee}</p>
                        <button onClick={() => approve(r.id)} className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white">{t("approve")}</button>
                      </div>
                    ))}
                    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("ready")}</p>
                    {rooms.filter((r) => r.status === "ready").map((r) => (<div key={r.id} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"><span className="text-sm font-semibold text-stone-700">{t("room")} {r.no}</span><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{t("ready")}</span></div>))}
                  </>
                )}

                {tab === "issues" && (
                  <>
                    <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t("maintenanceIssues")}</span><button onClick={() => setOverlay("report")} className="rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white">{t("reportBtn")}</button></div>
                    {issues.map((i) => (
                      <div key={i.id} className="mb-2 rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-1 flex items-center gap-1.5">
                          {i.urgent && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">⚠ {t("urgent")}</span>}
                          <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[8px] font-semibold text-stone-600">{i.cat}</span>
                          <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${i.status === "open" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>{i.status === "open" ? t("open") : t("fixed")}</span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">{i.desc[lang]}</p>
                        <p className="mt-0.5 text-[10px] text-stone-400">{t("room")} {i.room} · {t("reportedBy")} {i.by}</p>
                        {i.status === "open" && <button onClick={() => markFixed(i.id)} className="mt-2 w-full rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white">{t("markFixed")}</button>}
                      </div>
                    ))}
                  </>
                )}

                {tab === "checkin" && (
                  <>
                    <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                      <p className="text-[11px] text-stone-400">{new Date().toLocaleDateString(lang === "en" ? "en-IN" : lang === "ta" ? "ta-IN" : "hi-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
                      {role !== "owner" ? <button onClick={checkIn} className="mt-3 w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white">{t("checkInNow")}</button> : <p className="mt-2 text-xs text-stone-500">{present.length} {t("staffPresent")}</p>}
                    </div>
                    <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("presentToday")} ({present.length})</p>
                    {present.map((p) => (
                      <div key={p.name} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">{p.name[0]}</span><div><p className="text-xs font-semibold text-stone-700">{p.name}</p><p className="text-[9px] text-stone-400">{t("role_" + p.role)}</p></div></div>
                        <span className="text-[10px] font-medium text-emerald-600">{p.time}</span>
                      </div>
                    ))}
                  </>
                )}

                {tab === "dashboard" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Stat n={counts.ready} label={t("roomsReady")} color="bg-emerald-50 text-emerald-700" />
                      <Stat n={counts.toInspect} label={t("toInspectStat")} color="bg-blue-50 text-blue-700" />
                      <Stat n={counts.openIssues} label={t("openIssues")} color="bg-rose-50 text-rose-600" />
                      <Stat n={present.length} label={t("presentToday")} color="bg-amber-50 text-amber-700" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setOverlay("staff")} className="flex-1 rounded-xl bg-white py-2 text-[11px] font-semibold text-stone-700 shadow-sm">{t("staff")}</button>
                      <button onClick={() => setOverlay("hotel")} className="flex-1 rounded-xl bg-white py-2 text-[11px] font-semibold text-stone-700 shadow-sm">{t("hotel")}</button>
                    </div>
                    <div className="mt-2 rounded-xl bg-amber-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wide text-amber-600">{t("star")}</p><p className="text-sm font-bold text-stone-800">Jose</p><p className="text-[10px] text-stone-500">{t("cleanedRedos")}</p></div>
                    <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("roomBoard")}</p>
                    <div className="space-y-1.5">
                      {rooms.map((r) => (<div key={r.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"><div><span className="text-sm font-semibold text-stone-700">{t("room")} {r.no}</span><span className="ml-1.5 text-[10px] text-stone-400">{r.assignee}</span></div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLS[r.status]}`}>{t(r.status)}</span></div>))}
                    </div>
                  </>
                )}

                {tab === "reports" && (
                  <>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("presentPerDay")}</p>
                    <div className="mb-3 rounded-xl bg-white p-3 shadow-sm"><div className="flex h-16 items-end gap-1">{[2, 3, 4, 3, 4, 2, 4].map((v, i) => (<div key={i} className="flex-1 rounded-t bg-amber-400" style={{ height: `${(v / 4) * 100}%` }} />))}</div></div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">{t("issues")}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Stat n={issues.length} label={t("total")} color="bg-stone-100 text-stone-700" />
                      <Stat n={issues.filter((i) => i.status === "open").length} label={t("open")} color="bg-rose-50 text-rose-600" />
                      <Stat n={issues.filter((i) => i.status === "fixed").length} label={t("fixed")} color="bg-emerald-50 text-emerald-700" />
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm"><span className="text-[11px] text-stone-500">{t("avgFix")}</span><span className="text-xs font-bold text-stone-800">8h 28m</span></div>
                    <div className="mt-2 rounded-xl bg-emerald-50 py-2.5 text-center text-xs font-semibold text-emerald-700">{t("exportExcel")}</div>
                  </>
                )}

                {overlay && (
                  <div className="absolute inset-0 z-10 flex flex-col bg-stone-50">
                    <div className="flex items-center justify-between border-b border-stone-200 bg-white px-3 py-2.5">
                      <span className="text-sm font-bold text-stone-800">{overlay === "notif" ? t("notifications") : overlay === "staff" ? t("staffTitle") : overlay === "hotel" ? t("hotelProfile") : t("reportAnIssue")}</span>
                      <button onClick={() => setOverlay(null)} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      {overlay === "notif" && notifs.map((n) => (<div key={n.id} className="mb-1.5 rounded-xl bg-white p-2.5 shadow-sm"><p className="text-xs text-stone-700">{n.text}</p><p className="mt-0.5 text-[9px] text-stone-400">{n.time}</p></div>))}
                      {overlay === "staff" && (<>
                        <button className="mb-2 w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white">{t("addStaff")}</button>
                        {staff.map((s) => (<div key={s.name} className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"><div><p className="text-xs font-semibold text-stone-700">{s.name}</p><p className="text-[9px] text-stone-400">{t("role_" + s.role)} · {s.lang}</p></div><button onClick={() => setStaff((st) => st.map((x) => x.name === s.name ? { ...x, active: !x.active } : x))} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>{s.active ? t("active") : t("inactive")}</button></div>))}
                      </>)}
                      {overlay === "hotel" && (<div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"><Image src="/icon-192.png" alt="" width={44} height={44} className="rounded-lg" /><div><p className="text-sm font-bold text-stone-800">Grand Palace Hotel</p><p className="text-[10px] text-stone-400">{t("roomsStaff")}</p></div></div>
                        <div className="rounded-xl bg-white p-3 text-xs text-stone-600 shadow-sm"><p className="font-semibold text-stone-700">{t("address")}</p><p className="mt-0.5">123 Race Course Road, Coimbatore, TN 641018</p><p className="mt-2 font-semibold text-amber-700">{t("viewMap")}</p></div>
                        <div className="rounded-xl bg-white p-3 text-xs shadow-sm"><p className="font-semibold text-stone-700">{t("language")}</p><div className="mt-1.5 flex gap-1.5">{(["en", "ta", "hi"] as Lang[]).map((l) => (<button key={l} onClick={() => setLang(l)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${lang === l ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600"}`}>{l === "en" ? "English" : l === "ta" ? "தமிழ்" : "हिन्दी"}</button>))}</div></div>
                      </div>)}
                      {overlay === "report" && (<div className="space-y-3">
                        <div><p className="mb-1 text-[11px] font-semibold text-stone-600">{t("room")}</p><div className="flex flex-wrap gap-1.5">{rooms.map((r) => (<button key={r.id} onClick={() => setRiRoom(r.no)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riRoom === r.no ? "bg-amber-600 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{r.no}</button>))}</div></div>
                        <div><p className="mb-1 text-[11px] font-semibold text-stone-600">{t("category")}</p><div className="flex flex-wrap gap-1.5">{["Plumbing", "Electrical", "Maintenance", "Other"].map((c) => (<button key={c} onClick={() => setRiCat(c)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riCat === c ? "bg-stone-800 text-white" : "bg-white text-stone-600 shadow-sm"}`}>{c}</button>))}</div></div>
                        <div><p className="mb-1 text-[11px] font-semibold text-stone-600">{t("description")}</p><textarea value={riDesc} onChange={(e) => setRiDesc(e.target.value)} rows={2} className="w-full rounded-xl border border-stone-300 p-2 text-xs" /></div>
                        <button onClick={() => setRiUrgent((u) => !u)} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm">{t("markUrgent")}<span className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${riUrgent ? "bg-rose-500" : "bg-stone-300"}`}><span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${riUrgent ? "translate-x-6" : "translate-x-1"}`} /></span></button>
                        <div className="flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2 text-[11px] font-medium text-amber-700">{t("addMedia")}</div>
                        <button onClick={submitIssue} className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white">{t("submitIssue")}</button>
                      </div>)}
                    </div>
                  </div>
                )}

                {toast && <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-xl bg-stone-900/90 px-3 py-2 text-center text-sm font-bold text-white">{toast}</div>}
              </div>

              {/* Bottom nav */}
              <div className="flex border-t border-stone-200 bg-white">
                {TABS[role].map((tb) => {
                  const active = tab === tb.key && !overlay;
                  return (<button key={tb.key} onClick={() => { setTab(tb.key); setOverlay(null); }} className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${active ? "text-orange-500" : "text-stone-400"}`}><span className="text-base leading-none">{tb.icon}</span><span className="text-[8px] font-medium leading-none">{t(TAB_LABEL[tb.key])}</span></button>);
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

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
  return (<div className={`rounded-xl p-2.5 text-center ${color}`}><p className="text-lg font-bold leading-tight">{n}</p><p className="text-[9px] leading-snug">{label}</p></div>);
}
