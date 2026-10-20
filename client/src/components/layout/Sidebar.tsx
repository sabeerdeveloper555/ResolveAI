import { Command, X, Zap, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  navGroups,
  userName,
  userInitials,
  userRole,
  workspaceName,
} from '@/lib/navigation';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <aside
      id="app-sidebar"
      aria-label="Main navigation"
      className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:visible lg:translate-x-0 ${
        mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
      }`}
    >
      <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          aria-label="ResolveAI — go to dashboard"
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Command size={22} />
          </span>
          <span className="text-left">
            <span className="block text-lg font-bold tracking-tight">
              ResolveAI
            </span>
            <span className="block text-[11px] text-slate-500">
              Workflow automation platform
            </span>
          </span>
        </NavLink>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 lg:hidden"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>

      {/* Static presentation of the current workspace — no switching logic. */}
      <div className="px-4 pt-6">
        <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
              A
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {workspaceName}
              </span>
              <span className="block text-xs text-slate-500">Free plan</span>
            </span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pt-7 pb-4">
        {navGroups.map((group) => (
          <div key={group.heading}>
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {group.heading}
            </p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
                      isActive
                        ? 'bg-slate-900 font-medium text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-9 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm">
            <Zap size={18} />
          </div>
          <p className="text-sm font-semibold">Build your first workflow</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Chain triggers, actions and AI steps — without writing glue code.
          </p>
          <NavLink
            to="/workflows/new"
            onClick={onClose}
            className="mt-3 inline-flex items-center gap-2 rounded-md text-xs font-semibold text-slate-900 hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            New workflow <ArrowRight size={14} />
          </NavLink>
        </div>
      </nav>

      <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{userName}</p>
          <p className="truncate text-xs text-slate-500">{userRole}</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
