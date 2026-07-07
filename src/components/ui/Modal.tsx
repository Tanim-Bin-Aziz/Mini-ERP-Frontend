import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-lg bg-surface shadow-pop scrollbar-thin dark:bg-ink sm:max-w-md sm:rounded-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-white/10">
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
