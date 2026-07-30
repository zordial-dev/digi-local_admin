import React from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DashboardMetrics } from '../../types/dashboard';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const kpis = [
    {
      title: 'Total Platform Revenue',
      value: formatCurrency(metrics?.totalRevenue || 184950),
      trend: `+${metrics?.revenueChangePercent || 14.2}%`,
      icon: <DollarSign className="h-5 w-5 text-[#4F46E5]" />,
      badgeVariant: 'forest' as const,
    },
    {
      title: 'Active Local Vendors',
      value: formatNumber(metrics?.activeVendors || 1420),
      trend: `+${metrics?.vendorsChangePercent || 8.6}%`,
      icon: <Users className="h-5 w-5 text-[#10B981]" />,
      badgeVariant: 'forest' as const,
    },
    {
      title: 'Active Subscriptions',
      value: formatNumber(metrics?.totalSubscriptions || 980),
      trend: `+${metrics?.subscriptionsChangePercent || 12.4}%`,
      icon: <CreditCard className="h-5 w-5 text-[#F59E0B]" />,
      badgeVariant: 'gold' as const,
    },
    {
      title: 'Merchant Retention Rate',
      value: `${metrics?.growthRatePercent || 94.6}%`,
      trend: `+${metrics?.growthRateChangePercent || 2.1}%`,
      icon: <TrendingUp className="h-5 w-5 text-[#06B6D4]" />,
      badgeVariant: 'cyan' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} interactive className="bg-white border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="font-sans text-[12px] font-medium text-[#64748B]">
              {kpi.title}
            </span>
            <div className="h-10 w-10 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              {kpi.icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className="font-serif text-[24px] font-bold text-[#0F172A] tracking-tight">
              {kpi.value}
            </h2>
            <Badge variant={kpi.badgeVariant} showDot>
              <span>{kpi.trend}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};
