import { CheckCircle2, LoaderCircle, CalendarClock } from 'lucide-react';

export type RunStatus = 'Success' | 'Failed' | 'Running' | 'Scheduled';

const statusConfig: Record<
  RunStatus,
  { wrapper: string; dot: string; icon: React.ReactNode | null }
> = {
  Success: {
    wrapper: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: <CheckCircle2 size={12} />,
  },
  Failed: {
    wrapper: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    icon: null,
  },
  Running: {
    wrapper: 'bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
    icon: <LoaderCircle size={12} className="animate-spin" />,
  },
  Scheduled: {
    wrapper: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
    icon: <CalendarClock size={12} />,
  },
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${config.wrapper}`}
    >
      {config.icon ?? (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      {status}
    </span>
  );
}
