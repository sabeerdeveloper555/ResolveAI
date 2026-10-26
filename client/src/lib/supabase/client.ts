// Single reusable Supabase client, used for AUTHENTICATION ONLY.
// Application data (workflows, runs, ...) must keep going through the
// existing Express API in src/lib/api — never query Supabase tables here.
//
// Configuration comes from Vite env vars (see client/.env.example):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY  (the publishable/anon key only —
//                                   never a secret or service-role key)
//
// Missing configuration throws a controlled, credential-free error at
// first use instead of silently connecting to an unintended project.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

function readRequiredEnv(value: string | undefined, name: string): string {
  const trimmed = (value ?? '').trim();

  // Placeholder values from .env.example must never reach a real client.
  if (
    !trimmed ||
    trimmed.includes('your-project-ref') ||
    trimmed.includes('your-publishable-key')
  ) {
    throw new SupabaseConfigError(
      `Missing frontend Supabase configuration: ${name} is not set in client/.env. ` +
        'Copy client/.env.example to client/.env and fill in your Supabase ' +
        'project URL and publishable key (Dashboard → Project Settings → API).',
    );
  }

  return trimmed.replace(/\/+$/, '');
}

let client: SupabaseClient | null = null;

// Lazy singleton: validation happens on first auth use, session persistence
// and automatic token refresh are enabled by default in the browser build,
// and the default PKCE flow is the supported browser auth flow.
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = readRequiredEnv(
    import.meta.env.VITE_SUPABASE_URL as string | undefined,
    'VITE_SUPABASE_URL',
  );
  const publishableKey = readRequiredEnv(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  );

  client = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  return client;
}
