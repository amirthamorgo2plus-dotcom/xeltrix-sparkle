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
  const [att, iss, ev] = await Promise.all([
    sb
      .from("attendance")
      .select("staff_name, check_in")
      .gte("check_in", startISO)
      .lt("check_in", endISO),
    sb
      .from("maintenance")
      .select("room_no, status, created_at")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
    sb
      .from("cleaning_events")
      .select("cleaner_name, event, duration_secs, created_at")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
  ]);

  const attRows = (att.data ?? []) as { staff_name: string; check_in: string }[];
  const issRows = (iss.data ?? []) as { room_no: string; status: string; created_at: string }[];
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

  return (
    <div>
      <Heading tkey="reportsTitle" />
      <ReportFilters scope={scope} value={value} />

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
      <div className="mb-3 grid grid-cols-3 gap-3">
        <StatTile value={issRows.length} tkey="mTotal" color="blue" />
        <StatTile value={issOpen} tkey="mOpen" color="rose" />
        <StatTile value={issFixed} tkey="mFixed" color="emerald" />
      </div>
      {scope === "month" && issRows.length > 0 && (
        <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="perDay" /></p>
          <DayBars data={issPerDay} color="rose" />
        </div>
      )}
      {issByRoom.length > 0 ? (
        <div className="mb-6 rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500"><TLabel tkey="byRoom" /></p>
          <BarChart data={issByRoom} color="rose" />
        </div>
      ) : (
        <div className="mb-6">
          <Empty tkey="noData" />
        </div>
      )}

      {/* Employee performance */}
      <SubHeading tkey="secPerformance" />
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
