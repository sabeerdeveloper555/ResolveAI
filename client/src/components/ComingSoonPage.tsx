import { ArrowRight, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import type { LucideIcon } from 'lucide-react';

interface PageStubProps {
  title: string;
  description: string;
  icon: LucideIcon;
  // What will ship in later phases, shown as an honest roadmap note.
  planned: string[];
}

// Consistent, self-contained layout for routes whose functionality lands in
// later phases. No banners overlaying other pages' content.
export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  planned,
}: PageStubProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
            <Icon size={20} />
          </span>
          <div>
            <p className="font-semibold">{title} is not wired up yet</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              This page shows the planned structure. Functionality will be built
              in later phases of ResolveAI.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            <Construction size={14} /> Planned for later phases
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {planned.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Back to dashboard <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
