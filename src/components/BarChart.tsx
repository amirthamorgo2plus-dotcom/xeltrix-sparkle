// Lightweight, dependency-free charts. Plain components (no client hooks).

const COLOR: Record<string, string> = {
  teal: "bg-teal-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
};

export type Bar = { label: string; value: number; hint?: string };

// Horizontal ranked bars — good for "by room" / per-employee comparisons.
export function BarChart({
  data,
  color = "teal",
  unit = "",
}: {
  data: Bar[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-xs text-slate-500">
            {d.label}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
            <div
              className={`h-full rounded-md ${COLOR[color] ?? COLOR.teal}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs font-semibold text-slate-700">
            {d.hint ?? `${d.value}${unit}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compact vertical bars — good for a per-day time series across a month.
export function DayBars({ data, color = "teal" }: { data: Bar[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-0.5" style={{ height: 96 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div
            className={`w-full rounded-t-sm ${COLOR[color] ?? COLOR.teal} ${
              d.value === 0 ? "opacity-20" : ""
            }`}
            style={{ height: `${Math.max(2, (d.value / max) * 80)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[8px] leading-none text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
