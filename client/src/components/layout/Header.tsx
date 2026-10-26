import { useState } from 'react';
import { Menu, Plus, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentPage } from '@/hooks/useCurrentPage';
import { useAuth } from '@/contexts/auth-context';

interface HeaderProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
}

function Header({ menuOpen, onOpenMenu }: HeaderProps) {
  const page = useCurrentPage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);

    const { error } = await logout();
    setSigningOut(false);

    // RequireAuth redirects to /login once the auth state clears; push
    // explicitly too so the user never stays on a protected page.
    if (!error) {
      navigate('/login', { replace: true });
    }
  };

  // Email is non-secret identity display data, safe to render.
  const userEmail = user?.email ?? '';

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

      <div className="flex min-w-0 items-center gap-2">
        {userEmail && (
          <span
            className="hidden max-w-[220px] truncate text-xs text-slate-500 sm:block"
            title={userEmail}
          >
            {userEmail}
          </span>
        )}

        <Link
          to="/workflows/new"
          className="hidden items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 sm:flex"
        >
          <Plus size={17} />
          New workflow
        </Link>

        <button
          onClick={handleLogout}
          disabled={signingOut}
          aria-label="Sign out"
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">
            {signingOut ? 'Signing out…' : 'Sign out'}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;
