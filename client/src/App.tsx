import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
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
    <Routes>
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
    </Routes>
  );
}

export default App;
