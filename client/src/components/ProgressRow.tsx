interface ProgressRowProps {
  label: string;
  value: string;
  width: string;
  color: string;
}

export function ProgressRow({ label, value, width, color }: ProgressRowProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-800">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}
