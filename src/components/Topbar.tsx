import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { logout as logoutAction } from "@/store/authSlice";
import { api } from "@/lib/axios";

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export const Topbar = ({ onMenuClick, title }: TopbarProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // even if the network call fails, clear local session
    } finally {
      dispatch(logoutAction());
      navigate("/login", { replace: true });
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur dark:border-white/10 dark:bg-ink/90">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-ink-soft dark:text-white/60 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-base font-semibold text-ink dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-paper dark:hover:bg-white/5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold-dark">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight">
                {user?.name}
              </span>
              <span className="block text-xs leading-tight text-ink-faint">
                {user?.role}
              </span>
            </span>
            <ChevronDown size={14} className="text-ink-faint" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-pop dark:border-white/10 dark:bg-ink">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-paper dark:hover:bg-white/5"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
