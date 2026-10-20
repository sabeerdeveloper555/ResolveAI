import { useEffect, useRef, useState } from 'react';
import {
  Workflow,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/MetricCard';
import { ProgressRow } from '@/components/ProgressRow';
import { Avatar } from '@/components/Avatar';
import { RunStatusBadge, type RunStatus } from '@/components/RunStatusBadge';
import ApiHealthCard from '@/components/ApiHealthCard';

// Clearly identified mock data — real run metrics arrive with later phases.
const mockRuns: {
  id: string;
  workflow: string;
  trigger: string;
  status: RunStatus;
  started: string;
  duration: string;
  result: string;
}[] = [
  {
    id: 'RUN-2087',
    workflow: 'Invoice triage → Slack review',
    trigger: 'Gmail label added',
    status: 'Success',
    started: '4 min ago',
    duration: '11s',
    result: '3 steps completed',
  },
  {
    id: 'RUN-2086',
    workflow: 'Daily standup summary',
    trigger: 'Schedule · 09:00',
    status: 'Success',
    started: '2 hours ago',
    duration: '6s',
    result: 'Summary delivered',
  },
  {
    id: 'RUN-2085',
    workflow: 'Lead enrichment (AI step)',
    trigger: 'New form submission',
    status: 'Failed',
    started: '3 hours ago',
    duration: '42s',
    result: 'HTTP 429 from tool step',
  },
  {
    id: 'RUN-2084',
    workflow: 'Docs sync → knowledge base',
    trigger: 'Manual run',
    status: 'Running',
    started: 'just now',
    duration: '1m 07s',
    result: 'Step 2 of 4',
  },
  {
    id: 'RUN-2083',
    workflow: 'Weekly report draft',
    trigger: 'Schedule · Mondays',
    status: 'Scheduled',
    started: 'in 2 days',
    duration: '—',
    result: 'Queued by trigger',
  },
];

const filters = ['All runs', 'Success', 'Failed', 'In progress'] as const;
type Filter = (typeof filters)[number];

function matchesFilter(run: { status: RunStatus }, filter: Filter): boolean {
  switch (filter) {
    case 'All runs':
      return true;
    case 'Success':
      return run.status === 'Success';
    case 'Failed':
      return run.status === 'Failed';
    case 'In progress':
      return run.status === 'Running' || run.status === 'Scheduled';
  }
}

function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All runs');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Implement the "/" shortcut shown next to the search field.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredRuns = mockRuns.filter((run) => {
    const matchesSearch = `${run.id} ${run.workflow} ${run.trigger}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && matchesFilter(run, activeFilter);
  });

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Workspace overview · mock data
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[30px]">
            Good morning, Sabeer 👋
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Here’s what’s happening across your automated workflows today.
          </p>
        </div>

        <Link
          to="/workflows"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          <Workflow size={17} />
          View all workflows
          <ArrowRight size={15} />
        </Link>
      </div>

      <section
        aria-label="Workflow metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Total workflows"
          value="24"
          change="+4"
          description="vs. last month"
          icon={<Workflow size={19} />}
          trend="up"
        />
        <MetricCard
          title="Active workflows"
          value="18"
          change="+2"
          description="vs. last month"
          icon={<PlayCircle size={19} />}
          trend="up"
        />
        <MetricCard
          title="Successful runs"
          value="1,142"
          change="+12.8%"
          description="vs. last month"
          icon={<CheckCircle2 size={19} />}
          trend="up"
        />
        <MetricCard
          title="Failed runs"
          value="37"
          change="+6.1%"
          description="vs. last month"
          icon={<XCircle size={19} />}
          trend="up"
          positive={false}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="font-semibold">Recent runs</h3>
              <p className="mt-1 text-xs text-slate-500">
                Latest activity across your workflows.
              </p>
            </div>
            <label className="hidden h-10 w-52 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:flex">
              <span className="sr-only">Search runs</span>
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                id="run-search"
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search runs..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <span
                aria-hidden="true"
                className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400"
              >
                /
              </span>
            </label>
          </div>

          <div
            className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 sm:px-6"
            role="group"
            aria-label="Filter runs by status"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-400 ${
                  activeFilter === filter
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-6 py-3">
                    Workflow
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trigger
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Started
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {run.workflow}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {run.id} · {run.result}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {run.trigger}
                    </td>
                    <td className="px-4 py-4">
                      <RunStatusBadge status={run.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                      {run.started}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                      {run.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRuns.length === 0 && (
              <div className="p-10 text-center">
                <Search size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium">No runs found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another search or filter.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing {filteredRuns.length} of {mockRuns.length} sample runs
            </p>
            <button
              onClick={() => {
                setActiveFilter('All runs');
                setSearch('');
              }}
              className="rounded-md text-xs font-medium text-slate-700 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Run performance</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Last 30 days · sample data
                </p>
              </div>
              <span className="rounded-lg bg-violet-50 p-2 text-violet-700">
                <Sparkles size={19} />
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">96.9%</p>
                <p className="mt-1 text-xs text-slate-500">
                  Runs completed successfully
                </p>
              </div>
              <span className="mb-1 text-xs font-semibold text-emerald-600">
                +2.3% vs. prev.
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[96.9%] rounded-full bg-slate-900" />
            </div>

            <div className="mt-5 space-y-4">
              <ProgressRow
                label="Completed automatically"
                value="96.9%"
                width="96.9%"
                color="bg-emerald-500"
              />
              <ProgressRow
                label="Needed manual retry"
                value="2.1%"
                width="2.1%"
                color="bg-amber-400"
              />
              <ProgressRow
                label="Failed permanently"
                value="1.0%"
                width="1.0%"
                color="bg-rose-400"
              />
            </div>

            <div className="mt-6 flex gap-3 rounded-lg bg-slate-50 p-3.5">
              <Zap size={18} className="mt-0.5 shrink-0 text-violet-600" />
              <div>
                <p className="text-xs font-semibold">Insight</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Scheduled reports are your most reliable workflows. Tool rate
                  limits cause most failures — retry policies will help.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Collaborators</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Workspace members at a glance
                </p>
              </div>
              <Link
                to="/settings"
                aria-label="View workspace settings"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-5 flex items-center">
              <div className="flex -space-x-2">
                <Avatar
                  initials="OM"
                  color="bg-violet-100 text-violet-700"
                  stacked
                  label="Olivia Martin"
                />
                <Avatar
                  initials="JL"
                  color="bg-sky-100 text-sky-700"
                  stacked
                  label="Jackson Lee"
                />
                <Avatar
                  initials="SP"
                  color="bg-rose-100 text-rose-700"
                  stacked
                  label="Sophia Patel"
                />
                <Avatar
                  initials="WK"
                  color="bg-amber-100 text-amber-700"
                  stacked
                  label="William Kim"
                />
              </div>
              <p className="ml-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">4 members</span>{' '}
                in this workspace
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600" />
                Member list is sample data — team management is not yet
                implemented.
              </div>
            </div>
          </div>

          <ApiHealthCard />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
