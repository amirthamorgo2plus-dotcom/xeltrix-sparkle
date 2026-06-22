import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/919731412112";

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-orange-500" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  );
}

function CheckItem({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 px-3 py-2.5 last:border-0">
      <span className="text-[11px] text-stone-700">{label}</span>
      <Toggle on={on} />
    </div>
  );
}

function NavTab({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 ${active ? "text-orange-500" : "text-stone-400"}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[8px] font-medium leading-none">{label}</span>
    </div>
  );
}

function MiniBar({ label, pct, n }: { label: string; pct: number; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-10 shrink-0 text-right text-[8px] text-stone-500">{label}</span>
      <div className="flex-1 rounded-full bg-stone-100">
        <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-2.5 text-[8px] font-semibold text-stone-600">{n}</span>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-2xl">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-stone-800">{title}</h3>
      <p className="text-sm leading-relaxed text-stone-500">{body}</p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-orange-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix Sparkle" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">Xeltrix Sparkle</span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            English · தமிழ் · हिन्दी
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl">
            Hotel housekeeping,&nbsp;finally under&nbsp;control.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-stone-600">
            Replace WhatsApp chaos with room checklists, photo reports, real-time
            dashboards and instant push alerts — in English, Tamil &amp; Hindi.
            Every room guest-ready, every shift accountable.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Book a demo
            </a>
            <Link
              href="/login"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-700 hover:bg-stone-100"
            >
              Login
            </Link>
          </div>
        </div>

        {/* ── Phone mockups ── */}
        <div className="flex items-end justify-center gap-3">

          {/* Cleaner view */}
          <div className="w-[185px] shrink-0 rounded-[2rem] bg-stone-900 p-1.5 shadow-xl">
            <div className="flex flex-col overflow-hidden rounded-[1.7rem] bg-stone-50">
              {/* App header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-2 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold">✨ Xeltrix Sparkle</p>
                    <p className="text-[8px] text-orange-100">Raj · cleaner</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-semibold">
                    🔔 Alerts
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-stone-800">Room 1001</span>
                  <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-[8px] font-semibold text-pink-600">Maintenance</span>
                </div>
                <div className="rounded-xl bg-white shadow-sm">
                  <CheckItem label="Floor cleaned" on={true} />
                  <CheckItem label="Bathroom cleaned" on={true} />
                  <CheckItem label="Bed arranged" on={false} />
                  <CheckItem label="Bin emptied" on={true} />
                  <CheckItem label="AC working" on={false} />
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-1.5 text-[9px] font-medium text-amber-700">
                  📷 Add photos
                </div>
                {/* Photo thumbnail */}
                <div className="mt-1.5 h-7 w-7 overflow-hidden rounded-lg bg-stone-300">
                  <div className="h-full w-full bg-gradient-to-br from-stone-400 to-stone-500" />
                </div>
                <button className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-[10px] font-bold text-white">
                  Mark Cleaned
                </button>
                <button className="mt-1.5 w-full rounded-xl bg-pink-50 py-1.5 text-[9px] font-semibold text-pink-600">
                  🔧 Report Issue
                </button>
              </div>
              {/* Bottom nav — 3 tabs for cleaner */}
              <div className="flex border-t border-stone-200 bg-white">
                <NavTab icon="🛏" label="My Rooms" active />
                <NavTab icon="🔧" label="Issues" />
                <NavTab icon="⏰" label="Check In" />
              </div>
            </div>
          </div>

          {/* Owner reports view — elevated */}
          <div className="w-[205px] shrink-0 -translate-y-4 rounded-[2rem] bg-stone-900 p-1.5 shadow-2xl ring-2 ring-amber-400/40">
            <div className="flex flex-col overflow-hidden rounded-[1.7rem] bg-stone-50">
              {/* App header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-2 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold">✨ Xeltrix Sparkle</p>
                    <p className="text-[8px] text-orange-100">Saratha · owner</p>
                  </div>
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-semibold">
                    🔔 Alerts
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-2.5">
                {/* Oldest open issues */}
                <p className="mb-1 text-[8px] font-semibold text-stone-400 uppercase tracking-wide">Oldest open issues</p>
                <div className="mb-2 space-y-0.5 rounded-xl bg-white p-2 shadow-sm">
                  {[
                    { room: "#1003", label: "Water bottles not available", urgent: true },
                    { room: "#1001", label: "Tap is leaking", urgent: true },
                    { room: "#1001", label: "Floor not clean…", urgent: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {item.urgent && <span className="text-[7px]">⚠️</span>}
                      <span className="text-[8px] font-semibold text-stone-500">{item.room}</span>
                      <span className="truncate text-[8px] text-stone-600">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Star performer */}
                <p className="mb-1 text-[8px] font-semibold text-stone-400 uppercase tracking-wide">Employee performance</p>
                <div className="mb-2 rounded-xl bg-amber-50 p-2">
                  <p className="text-[7px] font-bold text-amber-600 uppercase tracking-wide">⭐ Star Performer</p>
                  <p className="text-[11px] font-bold text-stone-800">Jose</p>
                  <p className="text-[8px] text-stone-500">2 Cleaned · 0 Redos</p>
                </div>

                {/* Staff cards */}
                {[
                  { name: "Jose", cleaned: 2, redos: 0, avg: "8m" },
                  { name: "Raj", cleaned: 1, redos: 0, avg: "4m" },
                ].map((s) => (
                  <div key={s.name} className="mb-1.5 rounded-xl bg-white p-2 shadow-sm">
                    <p className="mb-1 text-[9px] font-bold text-stone-700">{s.name}</p>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-stone-800">{s.cleaned}</p>
                        <p className="text-[7px] text-stone-400">Cleaned</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-800">{s.redos}</p>
                        <p className="text-[7px] text-stone-400">Redos</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-800">{s.avg}</p>
                        <p className="text-[7px] text-stone-400">Avg time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bottom nav — 5 tabs for owner */}
              <div className="flex border-t border-stone-200 bg-white">
                <NavTab icon="📊" label="Dashboard" />
                <NavTab icon="🔍" label="Inspect" />
                <NavTab icon="🔧" label="Issues" />
                <NavTab icon="📈" label="Reports" active />
                <NavTab icon="⏰" label="Check In" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Push alerts spotlight ── */}
      <section className="bg-amber-600 py-10 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <div className="text-5xl">🔔</div>
            <div>
              <h2 className="text-xl font-bold">Instant push alerts — for everyone</h2>
              <p className="mt-1 max-w-xl text-amber-100">
                Supervisors get notified the moment a cleaner marks a room ready. Owners are alerted
                on urgent maintenance issues — right on their phone, even when the app is closed.
                No more checking WhatsApp every 10 minutes.
              </p>
            </div>
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              See it live
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Everything your housekeeping team needs
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-stone-500">
            One simple app for cleaners, supervisors and owners — each sees exactly what they need.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon="✅"
              title="Room checklists"
              body="Cleaners work through a clear per-room checklist and mark it ready — no missed steps, no paper."
            />
            <Feature
              icon="🧹"
              title="Room assignment"
              body="Supervisors assign each room to a cleaner in one tap. When a room is vacated, it goes straight back into the cleaning queue."
            />
            <Feature
              icon="🕒"
              title="Attendance & check-in"
              body="Staff check in from their phone each shift. Owners and supervisors see who's present today, live — no registers."
            />
            <Feature
              icon="📷"
              title="Photo & voice reports"
              body="Report a broken AC or leak with a photo and voice note. Nothing gets lost in a WhatsApp thread."
            />
            <Feature
              icon="⚠️"
              title="Urgent issue flag"
              body="Mark any issue as Urgent — supervisors and owners are alerted instantly so nothing waits."
            />
            <Feature
              icon="📊"
              title="Real-time owner reports"
              body="Live dashboards for attendance, open issues, avg fix times and star performer — by day or month."
            />
            <Feature
              icon="⭐"
              title="Star performer tracking"
              body="See who cleaned the most rooms, fastest, with zero redos — motivate your best staff with data."
            />
            <Feature
              icon="📥"
              title="Export to Excel"
              body="Download attendance, issues and performance as an Excel sheet — Tamil and Hindi supported — for payroll and audits."
            />
            <Feature
              icon="📲"
              title="Installs like an app"
              body="Add Xeltrix Sparkle to any phone's home screen — no Play Store, no downloads. Works even on a weak connection."
            />
            <Feature
              icon="🌐"
              title="English · தமிழ் · हिन्दी"
              body="Every screen in three languages so all your staff understand it instantly, without any training."
            />
            <Feature
              icon="👥"
              title="Roles that fit your team"
              body="Cleaner, supervisor and owner — each sees exactly what they need, protected by a 4-digit PIN."
            />
            <Feature
              icon="🔔"
              title="Push notifications"
              body="Staff get room assignments on their phone. Owners are alerted on urgent issues — even offline."
            />
            <Feature
              icon="🏨"
              title="Multi-hotel ready"
              body="Run one property or many — each hotel's rooms, staff and data stay fully private and separate."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Up and running in minutes
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Add rooms & staff",
                d: "Set up your rooms and add staff with a name + 4-digit PIN — no emails or passwords needed.",
              },
              {
                n: "2",
                t: "Assign & clean",
                d: "Supervisors assign rooms; cleaners tick checklists, add photo proof and mark rooms ready.",
              },
              {
                n: "3",
                t: "Track & improve",
                d: "Owners watch live reports — attendance, open issues, fix times, star performer — all in real time.",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-xl font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-stone-800">{s.t}</h3>
                <p className="text-sm leading-relaxed text-stone-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold text-stone-900">Made for</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { icon: "🏨", t: "Hotels", d: "Boutique to mid-size hotels keeping every room guest-ready." },
              { icon: "🌴", t: "Resorts", d: "Larger teams and grounds with many rooms across multiple shifts." },
              { icon: "🏢", t: "Service apartments", d: "Managed stays that need spotless turnarounds, every single time." },
            ].map((w) => (
              <div key={w.t} className="rounded-2xl bg-stone-50 p-6">
                <div className="mb-3 text-4xl">{w.icon}</div>
                <h3 className="mb-1 text-lg font-semibold text-stone-800">{w.t}</h3>
                <p className="text-sm text-stone-500">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-5 flex justify-center">
            <Image src="/icon-192.png" alt="Xeltrix Sparkle" width={60} height={60} className="rounded-2xl shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold">See Xeltrix Sparkle on your rooms</h2>
          <p className="mx-auto mt-3 max-w-md text-amber-50">
            Book a quick demo on WhatsApp and we&apos;ll set up your hotel the same day.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            💬 Book a demo on WhatsApp
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-8 text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix Sparkle" width={28} height={28} className="rounded-md" />
            <span className="font-semibold text-white">Xeltrix Sparkle</span>
          </div>
          <p className="text-sm">Hotel housekeeping &amp; operations</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="hover:text-white">Login</Link>
            <a href={WA} target="_blank" rel="noreferrer" className="hover:text-white">Contact</a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Xeltrix Sparkle · A product of Xeltrix
        </p>
      </footer>
    </div>
  );
}
