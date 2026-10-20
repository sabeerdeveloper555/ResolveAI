import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  // Whether the trend direction is a good thing (controls badge color).
  positive?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  description,
  icon,
  trend,
  positive = true,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-[30px] font-bold tracking-tight">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-semibold ${
            positive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {change}
        </span>
        <span className="text-xs text-slate-400">{description}</span>
      </div>
    </div>
  );
}
