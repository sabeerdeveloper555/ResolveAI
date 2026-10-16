import { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  X,
  Zap,
} from 'lucide-react';

const tickets = [
  {
    id: 'TKT-1048',
    customer: 'Olivia Martin',
    initials: 'OM',
    color: 'bg-violet-100 text-violet-700',
    subject: 'Unable to access my account',
    category: 'Account access',
    priority: 'High',
    status: 'Open',
    time: '4 min ago',
  },
  {
    id: 'TKT-1047',
    customer: 'Jackson Lee',
    initials: 'JL',
    color: 'bg-sky-100 text-sky-700',
    subject: 'Payment was charged twice',
    category: 'Billing',
    priority: 'High',
    status: 'In progress',
    time: '12 min ago',
  },
  {
    id: 'TKT-1046',
    customer: 'Isabella Nguyen',
    initials: 'IN',
    color: 'bg-rose-100 text-rose-700',
    subject: 'How do I update my subscription?',
    category: 'Subscription',
    priority: 'Medium',
    status: 'AI resolved',
    time: '28 min ago',
  },
  {
    id: 'TKT-1045',
    customer: 'William Kim',
    initials: 'WK',
    color: 'bg-amber-100 text-amber-700',
    subject: 'Order confirmation not received',
    category: 'Orders',
    priority: 'Low',
    status: 'Open',
    time: '36 min ago',
  },
  {
    id: 'TKT-1044',
    customer: 'Sophia Patel',
    initials: 'SP',
    color: 'bg-emerald-100 text-emerald-700',
    subject: 'Requesting a refund for my order',
    category: 'Refunds',
    priority: 'Medium',
    status: 'AI resolved',
    time: '51 min ago',
  },
];

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tickets', icon: Ticket, count: '12' },
  { label: 'AI Assistant', icon: Bot },
  { label: 'Customers', icon: Users },
];

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [activeFilter, setActiveFilter] = useState('All tickets');
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = `${ticket.id} ${ticket.customer} ${ticket.subject}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'All tickets' ||
      (activeFilter === 'Open' && ticket.status === 'Open') ||
      (activeFilter === 'In progress' && ticket.status === 'In progress') ||
      (activeFilter === 'Resolved' && ticket.status === 'AI resolved');

    return matchesSearch && matchesFilter;
  });

  function navigateTo(page: string) {
    setActivePage(page);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <button
            onClick={() => navigateTo('Overview')}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Command size={22} />
            </span>
            <span className="text-left">
              <span className="block text-lg font-bold tracking-tight">
                ResolveAI
              </span>
              <span className="block text-[11px] text-slate-500">
                Customer support platform
              </span>
            </span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-6">
          <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left hover:bg-slate-50">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                A
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Acme Workspace
                </span>
                <span className="block text-xs text-slate-500">Free plan</span>
              </span>
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map(({ label, icon: Icon, count }) => (
              <button
                key={label}
                onClick={() => navigateTo(label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                  activePage === label
                    ? 'bg-slate-900 font-medium text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </span>
                {count && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      activePage === label
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Manage
          </p>

          <button
            onClick={() => navigateTo('Settings')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              activePage === 'Settings'
                ? 'bg-slate-900 font-medium text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={() => navigateTo('Help & Support')}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              activePage === 'Help & Support'
                ? 'bg-slate-900 font-medium text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CircleHelp size={18} />
            Help & Support
          </button>
        </nav>

        <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm">
            <Sparkles size={18} />
          </div>
          <p className="text-sm font-semibold">Make support smarter</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Let AI handle repetitive questions so your team can focus on people.
          </p>
          <button
            onClick={() => navigateTo('AI Assistant')}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-900 hover:gap-3"
          >
            Explore AI <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
            SA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Sabeer Alam</p>
            <p className="truncate text-xs text-slate-500">Workspace admin</p>
          </div>
          <MoreHorizontal size={19} className="text-slate-400" />
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-xs text-slate-500">Workspace / Dashboard</p>
              <h1 className="mt-0.5 text-lg font-semibold tracking-tight">
                {activePage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <label className="hidden h-10 w-52 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </span>
            </label>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Toggle notifications"
              className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <Activity size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            <button
              onClick={() => navigateTo('Tickets')}
              className="hidden items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:flex"
            >
              <Plus size={17} />
              New ticket
            </button>
          </div>
        </header>

        {showNotifications && (
          <div className="absolute right-4 top-[68px] z-40 w-[min(340px,calc(100vw-32px))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:right-7">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Notifications</p>
              <button
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
                className="rounded p-1 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              You’re all caught up. New ticket alerts will appear here.
            </p>
          </div>
        )}

        <main className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-9">
          {activePage !== 'Overview' && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="rounded-lg bg-slate-100 p-2">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-semibold">{activePage}</p>
                <p className="mt-1 text-sm text-slate-500">
                  This section is part of the dashboard prototype. We’ll build
                  its full functionality in the next steps.
                </p>
              </div>
              <button
                onClick={() => navigateTo('Overview')}
                className="ml-auto text-sm font-medium text-slate-600 hover:text-slate-950"
              >
                Back to overview
              </button>
            </div>
          )}

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Workspace overview
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                Good morning, Sabeer 👋
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Here’s what’s happening with your customer support today.
              </p>
            </div>

            <button
              onClick={() => navigateTo('Tickets')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-slate-50"
            >
              <Headphones size={17} />
              View all tickets
              <ArrowRight size={15} />
            </button>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total tickets"
              value="1,284"
              change="+12.8%"
              description="vs. last month"
              icon={<Ticket size={19} />}
              trend="up"
            />
            <MetricCard
              title="Open tickets"
              value="48"
              change="-8.2%"
              description="vs. last month"
              icon={<MessageSquare size={19} />}
              trend="down"
            />
            <MetricCard
              title="AI resolution rate"
              value="76.4%"
              change="+5.4%"
              description="vs. last month"
              icon={<Bot size={19} />}
              trend="up"
            />
            <MetricCard
              title="Avg. response time"
              value="2m 34s"
              change="-18.6%"
              description="vs. last month"
              icon={<Clock3 size={19} />}
              trend="down"
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h3 className="font-semibold">Recent tickets</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Track and manage your latest support requests.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('Tickets')}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950"
                >
                  View all <ArrowRight size={15} />
                </button>
              </div>

              <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3 sm:px-6">
                {['All tickets', 'Open', 'In progress', 'Resolved'].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                        activeFilter === filter
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="bg-slate-50/70 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-3">Customer / Ticket</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${ticket.color}`}
                            >
                              {ticket.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {ticket.subject}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {ticket.id} · {ticket.customer}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          {ticket.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTickets.length === 0 && (
                  <div className="p-10 text-center">
                    <Search size={24} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium">No tickets found</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another search or filter.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-500">
                  Showing {filteredTickets.length} of {tickets.length} sample
                  tickets
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('All tickets');
                    setSearch('');
                  }}
                  className="text-xs font-medium text-slate-700 hover:text-slate-950"
                >
                  Reset filters
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">AI performance</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Automated support insights
                    </p>
                  </div>
                  <span className="rounded-lg bg-violet-50 p-2 text-violet-700">
                    <Sparkles size={19} />
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold tracking-tight">76.4%</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Tickets resolved by AI
                    </p>
                  </div>
                  <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <ArrowUpRight size={15} /> 5.4%
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[76.4%] rounded-full bg-slate-900" />
                </div>

                <div className="mt-5 space-y-4">
                  <ProgressRow
                    label="Resolved automatically"
                    value="76.4%"
                    width="76.4%"
                    color="bg-emerald-500"
                  />
                  <ProgressRow
                    label="Escalated to team"
                    value="16.2%"
                    width="16.2%"
                    color="bg-amber-400"
                  />
                  <ProgressRow
                    label="Needs review"
                    value="7.4%"
                    width="7.4%"
                    color="bg-violet-400"
                  />
                </div>

                <div className="mt-6 flex gap-3 rounded-lg bg-slate-50 p-3.5">
                  <Zap size={18} className="mt-0.5 shrink-0 text-violet-600" />
                  <div>
                    <p className="text-xs font-semibold">AI insight</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Faster automated responses can help your team focus on
                      more complex customer issues.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Team activity</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Support team at a glance
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('Customers')}
                    aria-label="View team"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="mt-5 flex items-center">
                  <div className="flex -space-x-2">
                    <TeamAvatar
                      initials="OM"
                      color="bg-violet-100 text-violet-700"
                    />
                    <TeamAvatar initials="JL" color="bg-sky-100 text-sky-700" />
                    <TeamAvatar
                      initials="SP"
                      color="bg-rose-100 text-rose-700"
                    />
                    <TeamAvatar
                      initials="WK"
                      color="bg-amber-100 text-amber-700"
                    />
                  </div>
                  <p className="ml-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      4 agents
                    </span>{' '}
                    on your team
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Available
                    </span>
                    <span className="text-sm font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Away
                    </span>
                    <span className="text-sm font-semibold">1</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Workspace activity is a demo preview.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 ResolveAI. Built for better customer support.</p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Frontend prototype
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  description,
  icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}) {
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
            trend === 'up'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-emerald-50 text-emerald-700'
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

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    High: 'bg-rose-50 text-rose-700 ring-rose-600/15',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    Low: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: 'bg-sky-50 text-sky-700',
    'In progress': 'bg-amber-50 text-amber-700',
    'AI resolved': 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status === 'AI resolved' ? (
        <CheckCircle2 size={12} />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'Open' ? 'bg-sky-500' : 'bg-amber-500'
          }`}
        />
      )}
      {status}
    </span>
  );
}

function ProgressRow({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: string;
  width: string;
  color: string;
}) {
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

function TeamAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${color}`}
    >
      {initials}
    </div>
  );
}

export default App;
