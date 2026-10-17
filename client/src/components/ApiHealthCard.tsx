import { useEffect, useState } from 'react';
import { Activity, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import {
  fetchApiHealth,
  getApiBaseUrl,
  getErrorMessage,
  type ApiHealth,
} from '@/lib/api';

type HealthState =
  | { phase: 'loading' }
  | { phase: 'success'; health: ApiHealth }
  | { phase: 'error'; message: string };

function ApiHealthCard() {
  const [state, setState] = useState<HealthState>({ phase: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchApiHealth(controller.signal)
      .then((health) => {
        setState({ phase: 'success', health });
      })
      .catch((error: unknown) => {
        // Ignore the rejection caused by unmount cleanup.
        if (controller.signal.aborted) return;
        setState({ phase: 'error', message: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ phase: 'loading' });
    setAttempt((current) => current + 1);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">API status</h3>
          <p className="mt-1 text-xs text-slate-500">Backend health check</p>
        </div>
        <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <Activity size={19} />
        </span>
      </div>

      <div className="mt-5">
        {state.phase === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <LoaderCircle size={16} className="animate-spin text-slate-400" />
            Checking API…
          </div>
        )}

        {state.phase === 'success' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-700">
              {state.health.service} is operational
            </span>
          </div>
        )}

        {state.phase === 'error' && (
          <div>
            <div className="flex items-start gap-2 text-sm text-rose-700">
              <TriangleAlert
                size={16}
                className="mt-0.5 shrink-0 text-rose-500"
              />
              <span>{state.message}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tried: {getApiBaseUrl()}/api/health — make sure the server is
              running on port 5000.
            </p>
            <button
              onClick={retry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiHealthCard;
