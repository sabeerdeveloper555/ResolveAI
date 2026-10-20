import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="rounded-xl bg-slate-100 p-3 text-slate-600">
        <Compass size={22} />
      </span>
      <p className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
        404
      </p>
      <h2 className="mt-2 text-lg font-semibold">Page not found</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you’re looking for doesn’t exist or was moved. Check the URL or
        head back to your dashboard.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFound;
