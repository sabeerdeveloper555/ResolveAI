import { Workflow, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

// Sample workflow definitions — persistence and the visual builder arrive in
// later phases, so these are static and clearly labeled.
const mockWorkflows: {
  name: string;
  description: string;
  trigger: string;
  steps: number;
  lastRun: string;
}[] = [
  {
    name: 'Invoice triage → Slack review',
    description:
      'Classify inbound invoices and post ones over a threshold to #finance.',
    trigger: 'Gmail label added',
    steps: 3,
    lastRun: '4 min ago',
  },
  {
    name: 'Daily standup summary',
    description:
      'Collect open tasks and post a formatted summary every morning.',
    trigger: 'Schedule · 09:00',
    steps: 4,
    lastRun: '2 hours ago',
  },
  {
    name: 'Lead enrichment (AI step)',
    description:
      'Enrich new form submissions with an AI research step before CRM sync.',
    trigger: 'New form submission',
    steps: 5,
    lastRun: '3 hours ago',
  },
];

function Workflows() {
  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Design and manage your automated workflows. Sample definitions below — the visual builder ships in a later phase."
      >
        <Link
          to="/workflows/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          <Plus size={17} />
          New workflow
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockWorkflows.map((workflow) => (
          <article
            key={workflow.name}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                <Workflow size={19} />
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                {workflow.steps} steps
              </span>
            </div>
            <h3 className="mt-4 font-semibold leading-snug">{workflow.name}</h3>
            <p className="mt-1.5 text-sm leading-5 text-slate-500">
              {workflow.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-500" />
                {workflow.trigger}
              </span>
              <span>Run {workflow.lastRun}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Workflows;
