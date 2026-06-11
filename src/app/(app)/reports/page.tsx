import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading, { SubHeading } from "@/components/Heading";
import StatTile from "@/components/StatTile";
import { BarChart, DayBars, Bar } from "@/components/BarChart";
import ReportFilters from "@/components/ReportFilters";
import Empty from "@/components/Empty";
import TLabel from "@/components/TLabel";

export const dynamic = "force-dynamic";

function fmtDur(secs: number | null): string {
  if (secs == null) return "—";
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; value?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role === "cleaner") redirect("/");

  const sp = await searchParams;
  const scope: "day" | "month" = sp.scope === "day" ? "day" : "month";
  const now = new Date();
  const value =
    sp.value ||
    (scope === "day" ? now.toISOString().slice(0, 10) : now.toISOString().slice(0, 7));

  // Date range [start, end)
  let start: Date;
  let end: Date;
  if (scope === "day") {
    start = new Date(value + "T00:00:00");
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else {
    start = new Date(value + "-01T00:00:00");
    end = new Date(start);
    end.setMonth(end.getMonth() + 1);
  }
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const sb = supabaseAdmin();
  const [att, iss, ev, aging] = await Promise.all([
    sb
      .from("attendance")
      .select("staff_name, check_in")
      .gte("check_in", startISO)
      .lt("check_in", endISO),
    sb
      .from("maintenance")
      .select("room_no, status, category, urgent, created_at, fixed_at")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
    sb
      .from("cleaning_events")
      .select("cleaner_name, event, duration_secs, created_at")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
    // Oldest still-open issues (not period-bound — a live action list).
    sb
      .from("maintenance")
      .select("id, room_no, issue, urgent, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .limit(5),
  ]);

  const attRows = (att.data ?? []) as { staff_name: string; check_in: string }[];
  const issRows = (iss.data ?? []) as {
    room_no: string;
    status: string;
    category: string | null;
    urgent: boolean | null;
    created_at: string;
    fixed_at: string | null;
  }[];
  const agingRows = (aging.data ?? []) as {
    id: string;
    room_no: string;
    issue: string;
    urgent: boolean | null;
    created_at: string;
  }[];
  const evRows = (ev.data ?? []) as {
    cleaner_name: string;
    event: string;
    duration_secs: number | null;
  }[];

  const daysInMonth =
    scope === "month"
      ? new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      : 1;

  // ---------- Attendance ----------
  const presentNames = new Set(attRows.map((r) => r.staff_name));
  let attBars: Bar[] = [];
  if (scope === "month") {
    const perDay = new Map<number, Set<string>>();
    for (const r of attRows) {
      const d = new Date(r.check_in).getDate();
      if (!perDay.has(d)) perDay.set(d, new Set());
      perDay.get(d)!.add(r.staff_name);
    }
    attBars = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      value: perDay.get(i + 1)?.size ?? 0,
    }));
  }

  // ---------- Issues ----------
  const issOpen = issRows.filter((r) => r.status === "open").length;
  const issFixed = issRows.filter((r) => r.status === "fixed").length;
  const issUrgent = issRows.filter((r) => r.urgent).length;

  // Avg time to fix (over issues fixed in the period).
  const fixDurs = issRows
    .filter((r) => r.status === "fixed" && r.fixed_at)
    .map((r) => (new Date(r.fixed_at!).getTime() - new Date(r.created_at).getTime()) / 1000);
  const avgFixSecs = fixDurs.length
    ? Math.round(fixDurs.reduce((a, b) => a + b, 0) / fixDurs.length)
    : null;

  // Issues by category.
  const CAT_KEY: Record<string, string> = {
    plumbing: "catPlumbing",
    electrical: "catElectrical",
    ac: "catAc",
    furniture: "catFurniture",
    cleaning: "catCleaning",
    other: "catOther",
  };
  const byCat = new Map<string, number>();
  for (const r of issRows) {
    const c = r.category ?? "other";
    byCat.set(c, (byCat.get(c) ?? 0) + 1);
  }
  const issByCat: Bar[] = Array.from(byCat.entries())
    .map(([c, v]) => ({ label: CAT_KEY[c] ?? c, value: v }))
    .sort((a, b) => b.value - a.value);

  const byRoom = new Map<string, number>();
  for (const r of issRows) byRoom.set(r.room_no ?? "—", (byRoom.get(r.room_no ?? "—") ?? 0) + 1);
  const issByRoom: Bar[] = Array.from(byRoom.entries())
    .map(([label, v]) => ({ label: `#${label}`, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  let issPerDay: Bar[] = [];
  if (scope === "month") {
    const perDay = new Map<number, number>();
    for (const r of issRows) {
      const d = new Date(r.created_at).getDate();
      perDay.set(d, (perDay.get(d) ?? 0) + 1);
    }
    issPerDay = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      value: perDay.get(i + 1) ?? 0,
    }));
  }

  // ---------- Employee performance ----------
  type Perf = { name: string; cleaned: number; redos: number; durs: number[] };
  const perf = new Map<string, Perf>();
  for (const e of evRows) {
    const name = e.cleaner_name ?? "—";
    if (!perf.has(name)) perf.set(name, { name, cleaned: 0, redos: 0, durs: [] });
    const p = perf.get(name)!;
    if (e.event === "cleaned") {
      p.cleaned++;
      if (e.duration_secs != null) p.durs.push(e.duration_secs);
    } else if (e.event === "redo") {
      p.redos++;
    }
  }
  const perfRows = Array.from(perf.values())
    .filter((p) => p.cleaned > 0 || p.redos > 0)
    .map((p) => {
      const avg = p.durs.length
        ? Math.round(p.durs.reduce((a, b) => a + b, 0) / p.durs.length)
        : null;
      const rate = p.cleaned + p.redos > 0 ? Math.round((p.redos / (p.cleaned + p.redos)) * 100) : 0;
      return { ...p, avg, rate };
    })
    .sort((a, b) => b.cleaned - a.cleaned);

  // Star performer: best score = cleaned*10 − redos*15 (must have cleaned > 0).
  const score = (c: number, r: number) => c * 10 - r * 15;
  const star = perfRows
    .filter((p) => p.cleaned > 0)
    .sort((a, b) => score(b.cleaned, b.redos) - score(a.cleaned, a.redos))[0];

  return (
    <div>
      <Heading tkey="reportsTitle" />
      <ReportFilters scope={scope} value={value} />

      <a
        href={`/api/reports/export?scope=${scope}&value=${value}`}
        className="mb-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700"
      >
        ⬇️ <TLabel tkey="exportExcel" />
      </a>

      {/* Attendance */}
      <SubHeading tkey="secAttendance" />
      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatTile value={presentNames.size} tkey="mPresent" color="teal" />
        <StatTile value={attRows.length} tkey="mCheckins" color="blue" />
      </div>
      {scope === "month" ? (
        <div className="mb-6 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="presentPerDay" /></p>
          <DayBars data={attBars} color="teal" />
        </div>
      ) : presentNames.size === 0 ? (
        <Empty tkey="noData" />
      ) : (
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from(presentNames).map((n) => (
            <span
              key={n}
              className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700"
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Issues */}
      <SubHeading tkey="secIssues" />
      <div className="mb-3 grid grid-cols-4 gap-2">
        <StatTile value={issRows.length} tkey="mTotal" color="blue" />
        <StatTile value={issOpen} tkey="mOpen" color="rose" />
        <StatTile value={issFixed} tkey="mFixed" color="emerald" />
        <StatTile value={issUrgent} tkey="mUrgent" color="amber" />
      </div>
      {avgFixSecs != null && (
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-slate-600">
            <TLabel tkey="avgFixTime" />
          </span>
          <span className="text-sm font-bold text-slate-800">{fmtDur(avgFixSecs)}</span>
        </div>
      )}
      {issByCat.length > 0 && (
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="byCategory" /></p>
          <BarChart data={issByCat} color="amber" i18nLabel />
        </div>
      )}
      {scope === "month" && issRows.length > 0 && (
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="perDay" /></p>
          <DayBars data={issPerDay} color="rose" />
        </div>
      )}
      {issByRoom.length > 0 && (
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="byRoom" /></p>
          <BarChart data={issByRoom} color="rose" />
        </div>
      )}
      {agingRows.length > 0 ? (
        <div className="mb-6 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="agingOpen" /></p>
          <ul className="space-y-2">
            {agingRows.map((a) => {
              const days = Math.floor(
                (now.getTime() - new Date(a.created_at).getTime()) / 86400000
              );
              return (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {a.urgent && <span className="mr-1 text-rose-600">⚠</span>}
                    #{a.room_no} · {a.issue}
                  </span>
                  <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                    {days}<TLabel tkey="daysOld" />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mb-6" />
      )}

      {/* Employee performance */}
      <SubHeading tkey="secPerformance" />
      {star && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 ring-1 ring-inset ring-amber-200">
          <span className="text-3xl">🏆</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              <TLabel tkey="starPerformer" />
            </p>
            <p className="truncate text-lg font-bold text-slate-800">{star.name}</p>
            <p className="text-xs text-slate-500">
              {star.cleaned} <TLabel tkey="mRoomsCleaned" /> · {star.redos}{" "}
              <TLabel tkey="mRedos" />
            </p>
          </div>
        </div>
      )}
      {perfRows.length === 0 ? (
        <Empty tkey="noData" />
      ) : (
        <div className="space-y-2">
          {perfRows.map((p) => (
            <div key={p.name} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{p.name}</span>
                {p.rate > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {p.rate}% <TLabel tkey="mRedoRate" />
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric tkey="mRoomsCleaned" value={String(p.cleaned)} />
                <Metric tkey="mRedos" value={String(p.redos)} />
                <Metric tkey="mAvgTime" value={fmtDur(p.avg)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ tkey, value }: { tkey: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-500">
        <TLabel tkey={tkey} />
      </p>
    </div>
  );
}
