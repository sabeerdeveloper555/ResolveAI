// Signup page — account creation via Supabase signUp().
//
// Confirm Email is ENABLED on this project, so a successful signup usually
// returns a user but NO session. That case is treated as "check your email",
// never as an authenticated success — the user is not signed in until the
// confirmation link is used.

import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup() {
  const { signup, isAuthenticated, initializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      // Matches the Supabase project minimum password length.
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    setFormError(null);

    if (errors.email || errors.password || errors.confirmPassword) return;

    setSubmitting(true);
    const result = await signup(email, password);
    setSubmitting(false);

    if (result.error) {
      // Generic message from the context; avoids user-enumeration details.
      setFormError(result.error);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setSubmitted(true);
      return;
    }

    // Confirmation disabled or auto-authenticated session: the auth state
    // change already signed the user in, so RedirectIfAuthenticated sends
    // them into the app — nothing manual to do here.
    setSubmitted(true);
  };

  if (!initializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            Confirm your email
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check your email to verify your account before signing in.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            If the message doesn&apos;t arrive within a few minutes, check your
            spam folder.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Start building automated workflows in minutes.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={fieldErrors.email ? true : undefined}
              disabled={submitting}
              className="h-10"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                disabled={submitting}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <Input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={fieldErrors.confirmPassword ? true : undefined}
              disabled={submitting}
              className="h-10"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="h-10 w-full bg-slate-900 text-white hover:bg-slate-700"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-slate-900 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
