// Shared full-screen shell for the Login and Signup pages, consistent with
// the existing ResolveAI design language (same palette, typography, logo).

import { type ReactNode } from 'react';
import { Command } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-center gap-3">
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
          </div>

          {children}
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-400">
        © 2026 ResolveAI. Built for automated workflows.
      </footer>
    </div>
  );
}
