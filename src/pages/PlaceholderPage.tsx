import { Card, CardContent } from '@/components/ui/Card';

export const PlaceholderPage = ({ title }: { title: string }) => (
  <Card>
    <CardContent>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-faint">
        This page will be built out in the next milestone (M6) with full CRUD, search, and
        pagination wired to the backend.
      </p>
    </CardContent>
  </Card>
);
