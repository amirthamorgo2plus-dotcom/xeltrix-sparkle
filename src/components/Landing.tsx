import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/919731412112";

function CheckRow({ label, on = true }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-[11px] font-medium text-stone-700">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
          on ? "bg-emerald-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-4" : ""}`}
        />
      </span>
    </div>
  );
}

function MiniBar({ label, pct, n }: { label: string; pct: number; n: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-right text-[9px] text-stone-500">{label}</span>
      <div className="flex-1 rounded-full bg-stone-100">
        <div className="h-2 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-3 text-[9px] font-semibold text-stone-600">{n}</span>
    </div>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-2 text-center ${color}`}>
      <p className="text-base font-bold leading-tight">{value}</p>
      <p className="text-[9px] leading-snug">{label}</p>
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
      <header className="sticky top-0 z-50 border-b border-amber-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon-192.png"
              alt="Xeltrix Sparkle"
              width={32}
              height={32}
              className="rounded-lg"
            />
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
            Replace WhatsApp chaos with room checklists, photo issue reports,
            and real-time owner dashboards — in English, Tamil &amp; Hindi.
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

        {/* ── Two phone mockups: cleaner + owner ── */}
        <div className="flex items-end justify-center gap-4">
          {/* Cleaner view */}
          <div className="w-[190px] shrink-0 rounded-[2rem] bg-stone-900 p-1.5 shadow-xl">
            <div className="overflow-hidden rounded-[1.7rem] bg-stone-50">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-3 py-2.5 text-white">
                <p className="text-[11px] font-semibold">✨ Xeltrix Sparkle</p>
                <p className="text-[9px] text-amber-100">Suresh · cleaner</p>
              </div>
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">Room 101</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                    Cleaning
                  </span>
                </div>
                <div className="divide-y divide-stone-100 rounded-xl bg-white shadow-sm">
                  <CheckRow label="Floor cleaned" />
                  <CheckRow label="Bathroom" />
                  <CheckRow label="Bed arranged" />
                  <CheckRow label="Bin emptied" on={false} />
                  <CheckRow label="AC working" />
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-2 text-[10px] font-medium text-amber-700">
                  📷 Add photo
                </div>
                <div className="mt-2 rounded-xl bg-amber-600 py-2 text-center text-[11px] font-semibold text-white">
                  Mark Cleaned ✓
                </div>
              </div>
            </div>
          </div>

          {/* Owner reports view — slightly taller / elevated */}
          <div className="w-[210px] shrink-0 -translate-y-4 rounded-[2rem] bg-stone-900 p-1.5 shadow-2xl ring-2 ring-amber-400/30">
            <div className="overflow-hidden rounded-[1.7rem] bg-stone-50">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-3 py-2.5 text-white">
                <p className="text-[11px] font-semibold">✨ Xeltrix Sparkle</p>
                <p className="text-[9px] text-amber-100">Anitha · owner</p>
              </div>
              <div className="p-3">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-stone-500">
                  Attendance
                </p>
                <div className="mb-2 grid grid-cols-2 gap-1.5">
                  <StatPill value="4" label="Present" color="bg-amber-50 text-amber-700" />
                  <StatPill value="7" label="Check-ins" color="bg-blue-50 text-blue-700" />
                </div>
                {/* Mini attendance bar chart */}
                <div className="mb-2 rounded-xl bg-white p-2 shadow-sm">
                  <p className="mb-1.5 text-[8px] text-stone-400">Present per day</p>
                  <div className="flex h-8 items-end gap-0.5">
                    {[0,0,0,0,0,0,0,0,2,3,4,0,0,0,0,0,0,0,0,0].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-amber-400"
                        style={{ height: v ? `${(v / 4) * 100}%` : "2px", opacity: v ? 1 : 0.15 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-stone-500">
                  Issues
                </p>
                <div className="mb-2 grid grid-cols-4 gap-1">
                  <StatPill value="7" label="Total" color="bg-stone-100 text-stone-700" />
                  <StatPill value="5" label="Open" color="bg-rose-50 text-rose-600" />
                  <StatPill value="2" label="Fixed" color="bg-emerald-50 text-emerald-700" />
                  <StatPill value="0" label="Urgent" color="bg-white border border-stone-200 text-stone-700" />
                </div>
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <p className="mb-1.5 text-[8px] text-stone-400">By category</p>
                  <div className="space-y-1.5">
                    <MiniBar label="Other" pct={71} n={5} />
                    <MiniBar label="Plumbing" pct={29} n={2} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-2.5 py-2 shadow-sm">
                  <span className="text-[9px] text-stone-500">Avg fix time</span>
                  <span className="text-[10px] font-bold text-stone-800">8h 28m</span>
                </div>
              </div>
            </div>
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
              body="Cleaners work through a clear checklist per room and mark it ready — no missed steps, no paper."
            />
            <Feature
              icon="📷"
              title="Photo maintenance reports"
              body="Report a broken AC or leak with a photo and voice note in seconds. Nothing gets lost in WhatsApp."
            />
            <Feature
              icon="📊"
              title="Real-time owner reports"
              body="Live dashboards for attendance, issues, avg fix times and star performer — by day or by month."
            />
            <Feature
              icon="🌐"
              title="English · தமிழ் · हिन्दी"
              body="Every screen in three languages so all your staff understand it instantly, without training."
            />
            <Feature
              icon="👥"
              title="Roles that fit your team"
              body="Cleaner, supervisor and owner — each sees exactly what they need, protected by a 4-digit PIN."
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
                d: "Owners watch live reports — who's present, what's pending, fix times and star performer.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm"
              >
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
              {
                icon: "🏢",
                t: "Service apartments",
                d: "Managed stays that need spotless turnarounds, every single time.",
              },
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
            <Image
              src="/icon-192.png"
              alt="Xeltrix Sparkle"
              width={60}
              height={60}
              className="rounded-2xl shadow-lg"
            />
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
            <Image
              src="/icon-192.png"
              alt="Xeltrix Sparkle"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-semibold text-white">Xeltrix Sparkle</span>
          </div>
          <p className="text-sm">Hotel housekeeping &amp; operations</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
            <a href={WA} target="_blank" rel="noreferrer" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Xeltrix Sparkle · A product of Xeltrix
        </p>
      </footer>
    </div>
  );
}
