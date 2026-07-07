import { NavLink } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { navItems } from './navConfig';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { hasPermission } = useAuth();
  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-surface transition-transform duration-200 dark:border-white/10 dark:bg-ink lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand font-display text-sm font-bold text-white">
              M
            </div>
            <span className="font-display text-sm font-semibold">Mini ERP</span>
          </div>
          <button onClick={onClose} className="text-ink-faint lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Menu
          </p>
          {visibleItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ink text-white shadow-card dark:bg-white dark:text-ink'
                    : 'text-ink-soft hover:bg-paper hover:text-ink dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={15} strokeWidth={2.5} className="opacity-90" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
