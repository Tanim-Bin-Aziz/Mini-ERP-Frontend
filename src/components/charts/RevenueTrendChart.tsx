import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import clsx from 'clsx';
import { dashboardApi } from '@/api/dashboard.api';

type Metric = 'revenue' | 'orders';
type ChartKind = 'area' | 'bar';

const toggleBtn = (active: boolean) =>
  clsx(
    'px-2.5 py-1 text-xs font-medium capitalize transition-colors',
    active
      ? 'bg-ink text-white dark:bg-white dark:text-ink'
      : 'bg-transparent text-ink-faint hover:text-ink'
  );

export const RevenueTrendChart = ({ days = 7 }: { days?: number }) => {
  const [metric, setMetric] = useState<Metric>('revenue');
  const [chartKind, setChartKind] = useState<ChartKind>('area');

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-trend', days],
    queryFn: () => dashboardApi.getRevenueTrend(days),
  });

  if (isLoading) {
    return <div className="flex h-56 items-center justify-center text-sm text-ink-faint">Loading chart…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-faint">
        Not enough sales data yet to plot a trend.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const formatTooltip = (value: number) =>
    metric === 'revenue' ? [`৳${value.toLocaleString()}`, 'Revenue'] : [value, 'Orders'];

  return (
    <div className="space-y-3">
      {/* Toggles */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(['revenue', 'orders'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMetric(m)} className={toggleBtn(metric === m)}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(['area', 'bar'] as const).map((c) => (
            <button key={c} type="button" onClick={() => setChartKind(c)} className={toggleBtn(chartKind === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={224}>
        {chartKind === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2B3A67" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2B3A67" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#8A8D97' }}
              axisLine={{ stroke: '#E7E5DF' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: '#8A8D97' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E7E5DF' }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#2B3A67"
              strokeWidth={2}
              fill="url(#revenueFill)"
              dot={chartData.length <= 14}
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#8A8D97' }}
              axisLine={{ stroke: '#E7E5DF' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: '#8A8D97' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E7E5DF' }}
            />
            <Bar dataKey={metric} fill="#2B3A67" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
