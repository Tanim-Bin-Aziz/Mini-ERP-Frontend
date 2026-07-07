import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  total,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-ink-faint">
      <span>{total} total records</span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="text-ink-soft">
          Page {page} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};
