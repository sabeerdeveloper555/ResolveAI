import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentPage } from '@/hooks/useCurrentPage';

interface HeaderProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
}

function Header({ menuOpen, onOpenMenu }: HeaderProps) {
  const page = useCurrentPage();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 lg:hidden"
          aria-label="Open navigation"
          aria-controls="app-sidebar"
          aria-expanded={menuOpen}
        >
          <Menu size={21} />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Workspace / {page.label}</p>
          <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight">
            {page.title}
          </h1>
        </div>
      </div>

      <Link
        to="/workflows/new"
        className="hidden items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 sm:flex"
      >
        <Plus size={17} />
        New workflow
      </Link>
    </header>
  );
}

export default Header;
