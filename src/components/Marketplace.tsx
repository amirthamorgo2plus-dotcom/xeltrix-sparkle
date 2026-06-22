import Image from "next/image";
import Link from "next/link";

const WA = "https://wa.me/919731412112";
const WAITLIST =
  "https://wa.me/919731412112?text=I%20want%20to%20join%20the%20Xeltrix%20Marketplace%20waitlist";

function Category({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md">
      <div className="mb-2 text-3xl">{icon}</div>
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{body}</p>
    </div>
  );
}

function Trust({ icon, title, body }: { icon: string; title: string; body: string }) {
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

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-orange-600/20 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">Xeltrix Marketplace</span>
          </Link>
          <a
            href={WAITLIST}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
          🚀 Coming soon
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl">
          Every hotel supplier, in one trusted marketplace.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
          Like Upwork — but for the hotel industry. Find verified laundry, cleaning chemical,
          linen, manpower and F&amp;B suppliers, post a requirement, compare quotes, and hire
          the best-rated one. In English, Tamil &amp; Hindi.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={WAITLIST}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
          >
            💬 Join the waitlist
          </a>
          <Link
            href="/"
            className="rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-stone-700 hover:bg-stone-100"
          >
            ← Back to Sparkle
          </Link>
        </div>
        <p className="mt-4 text-sm text-stone-400">
          Already a Xeltrix Sparkle hotel? You&apos;ll get early access from inside your dashboard.
        </p>
      </section>

      {/* ── Categories ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Every category your hotel buys
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-stone-500">
            One marketplace for everything that keeps a hotel running.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Category icon="🧺" title="Laundry services & equipment" body="Commercial laundry partners and machines for linen and uniforms." />
            <Category icon="🧴" title="Cleaning chemicals & hygiene" body="Housekeeping chemicals, sanitisers and hygiene supplies in bulk." />
            <Category icon="🛏️" title="Linen, towels & amenities" body="Bed linen, towels, toiletries and in-room guest amenities." />
            <Category icon="👷" title="Manpower & staffing" body="Housekeeping, F&B and front-desk staffing agencies, vetted by hotels." />
            <Category icon="🍽️" title="Food & beverage suppliers" body="Groceries, dairy, beverages and kitchen provisions." />
            <Category icon="🔧" title="Maintenance & engineering" body="AC, plumbing, electrical and equipment repair services." />
            <Category icon="🎨" title="Interior design & renovation" body="Room refurbishment, furniture and renovation contractors." />
            <Category icon="🛡️" title="Security services & systems" body="Guards, CCTV, access control and safety systems." />
            <Category icon="💻" title="Technology & software" body="PMS, POS, booking engines and housekeeping apps like Sparkle." />
            <Category icon="🏥" title="Medical tourism partners" body="Hospital tie-ups so hotels can host and refer medical-travel guests." />
            <Category icon="🧳" title="Travel & guest experience" body="Tours, transport and add-ons that delight your guests." />
            <Category icon="➕" title="…and more" body="New categories added as hotels ask for them." />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Post your requirement",
                d: "Tell us what you need — e.g. \"laundry service for 50 rooms\" — with budget and timeline. Takes 2 minutes.",
              },
              {
                n: "2",
                t: "Get matched quotes",
                d: "Verified suppliers near you respond with structured quotes. Compare price, rating and delivery side by side.",
              },
              {
                n: "3",
                t: "Hire & rate",
                d: "Pick the best supplier, pay safely through escrow, and rate them — building trust for every hotel after you.",
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

      {/* ── Why trust it (special features) ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Built on trust, not guesswork
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-stone-500">
            What makes Xeltrix Marketplace different from a random WhatsApp group or directory.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Trust icon="✅" title="Verified suppliers (KYC)" body="Every supplier is GST- and identity-verified before they go live. Look for the Verified badge." />
            <Trust icon="⭐" title="Ratings & Job Success Score" body="Real reviews from other hotels, plus an Upwork-style success score — so you hire on proof, not promises." />
            <Trust icon="📝" title="Structured RFQ & quotes" body="Post one requirement, get comparable quotes with line items — no more chasing ten people on WhatsApp." />
            <Trust icon="🔒" title="Escrow-protected payments" body="Your money is held safely and released only when you confirm the work is done." />
            <Trust icon="💬" title="WhatsApp-native" body="Get matched suppliers and quotes right on WhatsApp — the way hotel teams already work." />
            <Trust icon="🌐" title="English · தமிழ் · हिन्दी" body="The whole marketplace works in three languages, for buyers and suppliers alike." />
          </div>
        </div>
      </section>

      {/* ── Two-sided: hotels + suppliers ── */}
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-2">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
            <div className="mb-3 text-4xl">🏨</div>
            <h3 className="text-xl font-bold text-stone-900">For hotels</h3>
            <p className="mt-2 text-stone-600">
              Stop hunting for suppliers in WhatsApp groups. Discover verified, rated suppliers for
              every need, get competitive quotes in 48 hours, and pay safely.
            </p>
            <a
              href={WAITLIST}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Join as a hotel
            </a>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-8">
            <div className="mb-3 text-4xl">📦</div>
            <h3 className="text-xl font-bold text-stone-900">For suppliers</h3>
            <p className="mt-2 text-stone-600">
              Reach hundreds of hotels actively looking for what you sell. Build a verified profile,
              win leads on merit through ratings, and grow your hotel business.
            </p>
            <a
              href={WAITLIST}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              List your business
            </a>
          </div>
        </div>
      </section>

      {/* ── Waitlist CTA ── */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-5 flex justify-center">
            <Image src="/icon-192.png" alt="Xeltrix" width={60} height={60} className="rounded-2xl shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold">Be first when we launch</h2>
          <p className="mx-auto mt-3 max-w-md text-amber-50">
            Join the waitlist on WhatsApp. Early hotels and suppliers get a free Verified badge for
            6 months and priority onboarding.
          </p>
          <a
            href={WAITLIST}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
          >
            💬 Join the waitlist
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-8 text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Xeltrix" width={28} height={28} className="rounded-md" />
            <span className="font-semibold text-white">Xeltrix Marketplace</span>
          </div>
          <p className="text-sm">Coming soon · A product of Xeltrix</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-white">Sparkle</Link>
            <a href={WA} target="_blank" rel="noreferrer" className="hover:text-white">Contact</a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Xeltrix Marketplace
        </p>
      </footer>
    </div>
  );
}
