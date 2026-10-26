import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import {
  AuthConfigGate,
  RedirectIfAuthenticated,
  RequireAuth,
} from '@/components/auth/AuthGuards';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Workflows from '@/pages/Workflows';
import NewWorkflow from '@/pages/NewWorkflow';
import Assistant from '@/pages/Assistant';
import Runs from '@/pages/Runs';
import Knowledge from '@/pages/Knowledge';
import Integrations from '@/pages/Integrations';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthConfigGate>
      <Routes>
        {/* Public auth pages. Signed-in users leave them for the dashboard. */}
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Email-confirmation callback handled by the Supabase SDK flow. */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected application routes — unchanged internal functionality. */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflows" element={<Workflows />} />
            {/* Declared before any future /workflows/:id detail route. */}
            <Route path="/workflows/new" element={<NewWorkflow />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </AuthConfigGate>
  );
}

export default App;
