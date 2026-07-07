import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
    <p className="font-display text-5xl font-bold text-brand">404</p>
    <h1 className="font-display text-lg font-semibold text-ink">Page not found</h1>
    <p className="text-sm text-ink-faint">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard">
      <Button size="sm" className="mt-2">
        Back to dashboard
      </Button>
    </Link>
  </div>
);

export const ForbiddenPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
    <p className="font-display text-5xl font-bold text-danger">403</p>
    <h1 className="font-display text-lg font-semibold text-ink">Access denied</h1>
    <p className="text-sm text-ink-faint">
      Your role doesn't have permission to view this page.
    </p>
    <Link to="/dashboard">
      <Button size="sm" className="mt-2">
        Back to dashboard
      </Button>
    </Link>
  </div>
);
