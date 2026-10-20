import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Allow Escape to dismiss the mobile navigation drawer.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="min-h-screen lg:pl-[252px]">
        <Header
          menuOpen={mobileMenuOpen}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

        <main
          id="main-content"
          className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-9"
        >
          <Outlet />
        </main>

        <footer className="mx-auto flex max-w-[1600px] flex-col gap-2 border-t border-slate-200 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
          <p>© 2026 ResolveAI. Built for automated workflows.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Prototype — uses mock data until backend features ship
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AppShell;
