import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { SubscriptionTierPoint } from '../../types/dashboard';

export interface SubscriptionChartProps {
  data?: SubscriptionTierPoint[];
  isLoading?: boolean;
}

export const SubscriptionChart: React.FC<SubscriptionChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-xl">Subscription Tier Breakdown</CardTitle>
        <CardDescription>VENDOR SUBSCRIPTION DISTRIBUTIONS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontFamily: 'Inter',
                  }}
                  formatter={(val: any) => [
                    `${val || 0} Vendors`,
                    'Active Subscriptions',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 space-y-3">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-md bg-[var(--secondary)] border border-[var(--border)]"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-body text-xs font-semibold text-[var(--foreground)]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[var(--foreground)] font-bold">{item.count}</span>
                  <span className="text-[var(--muted-foreground)]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
