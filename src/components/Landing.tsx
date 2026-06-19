import Link from "next/link";

const WA = "https://wa.me/919731412112";

function CheckRow({ label, on = true }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 ${
          on ? "bg-emerald-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`}
        />
      </span>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">✨</span> Xeltrix Sparkle
          </div>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            Staff login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            English · தமிழ் · हिन्दी
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl">
            Hotel housekeeping, finally under control.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-stone-600">
            Replace WhatsApp chaos with room checklists, photo issue reports, and
            real-time reports — in English, Tamil &amp; Hindi. Every room
            guest-ready, every shift accountable.
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
              Staff login
            </Link>
          </div>
        </div>

        {/* Room-checklist mockup */}
        <div className="flex justify-center">
          <div className="w-[270px] rounded-[2rem] bg-stone-900 p-2 shadow-xl">
            <div className="overflow-hidden rounded-[1.6rem] bg-stone-50">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3 text-white">
                <p className="text-sm font-semibold">✨ Xeltrix Sparkle</p>
                <p className="text-[11px] text-amber-100">Suresh · cleaner</p>
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-stone-800">Room 101</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Cleaning
                  </span>
                </div>
                <div className="divide-y divide-stone-100 rounded-2xl bg-white shadow-sm">
                  <CheckRow label="Floor cleaned" />
                  <CheckRow label="Bathroom cleaned" />
                  <CheckRow label="Bed arranged" />
                  <CheckRow label="Bin emptied" on={false} />
                  <CheckRow label="AC working" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-3 text-sm font-medium text-amber-700">
                  📷 Add photos
                </div>
                <div className="mt-3 rounded-2xl bg-amber-600 py-3 text-center text-base font-semibold text-white">
                  Mark Cleaned
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Everything your housekeeping team needs
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-stone-500">
            One simple app for cleaners, supervisors and owners.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon="✅"
              title="Room checklists"
              body="Cleaners work through a clear checklist per room and mark it ready — no missed steps."
            />
            <Feature
              icon="📷"
              title="Photo maintenance reports"
              body="Report a broken AC or leak with a photo and voice note in seconds. Nothing gets lost."
            />
            <Feature
              icon="📊"
              title="Real-time owner reports"
              body="Live dashboards for attendance, issues, fix times and staff performance — day or month."
            />
            <Feature
              icon="🌐"
              title="English · தமிழ் · हिन्दी"
              body="Every screen in three languages so all your staff understand it instantly."
            />
            <Feature
              icon="👥"
              title="Roles that fit your team"
              body="Cleaner, supervisor and owner — each sees exactly what they need, nothing more."
            />
            <Feature
              icon="🏨"
              title="Multi-hotel ready"
              body="Run one property or many — each hotel's data stays private and separate."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Up and running in minutes
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Add rooms & staff", d: "Set up your rooms and add staff with a simple name + 4-digit PIN — no emails needed." },
              { n: "2", t: "Assign & clean", d: "Supervisors assign rooms; cleaners check them off with photo proof and mark them ready." },
              { n: "3", t: "Track & improve", d: "Owners watch live reports — who's present, what's pending, and who's performing best." },
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

      {/* Who it's for */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold text-stone-900">Made for</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { icon: "🏨", t: "Hotels", d: "Boutique to mid-size hotels keeping every room guest-ready." },
              { icon: "🌴", t: "Resorts", d: "Larger teams and grounds with many rooms and shifts." },
              { icon: "🏢", t: "Service apartments", d: "Managed stays that need spotless turnarounds, every time." },
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

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
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

      {/* Footer */}
      <footer className="bg-stone-900 py-8 text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="text-xl">✨</span> Xeltrix Sparkle
          </div>
          <p className="text-sm">Hotel housekeeping &amp; operations</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="hover:text-white">
              Staff login
            </Link>
            <a href={WA} target="_blank" rel="noreferrer" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Xeltrix Sparkle
        </p>
      </footer>
    </div>
  );
}
