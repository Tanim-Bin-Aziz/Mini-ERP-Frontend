import type { ReactNode } from 'react';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
      {/* Signature panel — ledger-inspired brand side, hidden on small screens */}
      <div className="relative hidden overflow-hidden bg-brand lg:col-span-2 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(180deg, transparent, transparent 27px, #fff 27px, #fff 28px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold font-display text-sm font-bold text-ink">
              M
            </div>
            <span className="font-display text-lg font-semibold text-white">Mini ERP</span>
          </div>
        </div>
        <div className="relative">
          <p className="font-display text-2xl font-semibold leading-snug text-white">
            Every sale,
            <br />
            every unit,
            <br />
            one ledger.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Track inventory, manage customers, and record sales — all reconciled in real time.
          </p>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Mini ERP</p>
      </div>

      {/* Form panel */}
      <div className="col-span-1 flex items-center justify-center bg-paper p-6 lg:col-span-3">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};
