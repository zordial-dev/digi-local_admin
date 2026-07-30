import React from 'react';
import { DollarSign, Store, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { DashboardMetrics } from '../../types/dashboard';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 mt-4" />
            <Skeleton className="h-4 w-20 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'TOTAL PLATFORM REVENUE',
      value: formatCurrency(metrics.totalRevenue),
      change: metrics.revenueChangePercent,
      icon: <DollarSign className="h-5 w-5 text-[var(--gold)]" />,
      subtext: 'vs last month',
    },
    {
      title: 'ACTIVE LOCAL VENDORS',
      value: formatNumber(metrics.activeVendors),
      change: metrics.vendorsChangePercent,
      icon: <Store className="h-5 w-5 text-[var(--primary)]" />,
      subtext: 'verified stores',
    },
    {
      title: 'ACTIVE SUBSCRIPTIONS',
      value: formatNumber(metrics.totalSubscriptions),
      change: metrics.subscriptionsChangePercent,
      icon: <CreditCard className="h-5 w-5 text-indigo-700" />,
      subtext: 'monthly recurring',
    },
    {
      title: 'PLATFORM RETENTION RATE',
      value: `${metrics.growthRatePercent}%`,
      change: metrics.growthRateChangePercent,
      icon: <TrendingUp className="h-5 w-5 text-emerald-700" />,
      subtext: 'annual retention',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const isPositive = item.change >= 0;

        return (
          <Card key={idx} className="p-6 gold-border-hover transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono-meta text-[10px] font-semibold text-[var(--muted-foreground)] tracking-wider">
                {item.title}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--secondary)] border border-[var(--border)]">
                {item.icon}
              </div>
            </div>

            <div className="mt-4">
              <span className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
                {item.value}
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono">
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {isPositive ? `+${item.change}%` : `${item.change}%`}
              </span>
              <span className="text-[var(--muted-foreground)]">{item.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
