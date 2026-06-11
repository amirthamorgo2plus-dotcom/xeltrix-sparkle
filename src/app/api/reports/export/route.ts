import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function rows(rs: unknown[][]): string {
  return rs.map((r) => r.map(csvCell).join(",")).join("\n");
}
function fmtDur(secs: number | null): string {
  if (secs == null) return "";
  const m = Math.round(secs / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "cleaner")
    return NextResponse.json({ error: "unauth" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const scope = sp.get("scope") === "day" ? "day" : "month";
  const now = new Date();
  const value =
    sp.get("value") ||
    (scope === "day" ? now.toISOString().slice(0, 10) : now.toISOString().slice(0, 7));

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
    sb.from("attendance").select("staff_name, check_in").gte("check_in", startISO).lt("check_in", endISO),
    sb
      .from("maintenance")
      .select("room_no, issue, category, urgent, status, created_at, fixed_at")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
    sb
      .from("cleaning_events")
      .select("cleaner_name, event, duration_secs")
      .gte("created_at", startISO)
      .lt("created_at", endISO),
  ]);

  const attRows = (att.data ?? []) as { staff_name: string; check_in: string }[];
  const issRows = (iss.data ?? []) as Record<string, unknown>[];
  const evRows = (ev.data ?? []) as {
    cleaner_name: string;
    event: string;
    duration_secs: number | null;
  }[];

  // Attendance: present days per person.
  const attAgg = new Map<string, number>();
  for (const r of attRows) attAgg.set(r.staff_name, (attAgg.get(r.staff_name) ?? 0) + 1);

  // Performance per cleaner.
  type P = { cleaned: number; redos: number; durs: number[] };
  const perf = new Map<string, P>();
  for (const e of evRows) {
    const n = e.cleaner_name ?? "—";
    if (!perf.has(n)) perf.set(n, { cleaned: 0, redos: 0, durs: [] });
    const p = perf.get(n)!;
    if (e.event === "cleaned") {
      p.cleaned++;
      if (e.duration_secs != null) p.durs.push(e.duration_secs);
    } else if (e.event === "redo") p.redos++;
  }

  const parts: string[] = [];
  parts.push(`Xeltrix Sparkle report,${scope},${value}`);
  parts.push("");
  parts.push("ATTENDANCE");
  parts.push("Staff,Check-ins");
  parts.push(rows(Array.from(attAgg.entries())));
  parts.push("");
  parts.push("ISSUES");
  parts.push("Room,Issue,Category,Urgent,Status,Reported,Fixed");
  parts.push(
    rows(
      issRows.map((r) => [
        r.room_no,
        r.issue,
        r.category,
        r.urgent ? "YES" : "",
        r.status,
        r.created_at,
        r.fixed_at,
      ])
    )
  );
  parts.push("");
  parts.push("EMPLOYEE PERFORMANCE");
  parts.push("Cleaner,Rooms cleaned,Redos,Avg time,Redo rate %");
  parts.push(
    rows(
      Array.from(perf.entries()).map(([name, p]) => {
        const avg = p.durs.length
          ? Math.round(p.durs.reduce((a, b) => a + b, 0) / p.durs.length)
          : null;
        const rate = p.cleaned + p.redos > 0 ? Math.round((p.redos / (p.cleaned + p.redos)) * 100) : 0;
        return [name, p.cleaned, p.redos, fmtDur(avg), rate];
      })
    )
  );

  const csv = "﻿" + parts.join("\n"); // BOM so Excel reads UTF-8 (Tamil/Hindi)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xeltrix-report-${value}.csv"`,
    },
  });
}
