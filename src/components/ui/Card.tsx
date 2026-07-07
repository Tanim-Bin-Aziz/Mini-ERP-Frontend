import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'rounded-lg border border-border bg-surface shadow-card dark:border-white/10 dark:bg-white/[0.03]',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('border-b border-border px-4 py-3 dark:border-white/10', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4', className)} {...props} />
);

type BadgeTone = 'neutral' | 'success' | 'danger' | 'gold' | 'brand';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-paper text-ink-soft border-border',
  success: 'bg-success/10 text-success border-success/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  gold: 'bg-gold/10 text-gold-dark border-gold/25',
  brand: 'bg-brand/10 text-brand border-brand/20',
};

export const Badge = ({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      toneClasses[tone],
      className
    )}
    {...props}
  />
);
