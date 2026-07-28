import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';

/**
 * Replaces src/proxy.ts from the Next.js app. This is a UX guard only — it
 * decides what to render, not what is permitted. The real enforcement is
 * [Authorize] on the API's write endpoints, which a hidden route cannot bypass.
 */
export default function ProtectedRoute() {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the session check, otherwise a signed-in admin refreshing the page
  // would be bounced to the login screen for a frame.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="w-5 h-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Checking session…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
