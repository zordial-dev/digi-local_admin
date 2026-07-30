import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { RevenuePoint } from '../../types/dashboard';
import { formatCurrency } from '../../utils/formatters';

export interface RevenueChartProps {
  data?: RevenuePoint[];
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-xl">Revenue & Profit Overview</CardTitle>
        <CardDescription>MONTHLY FINANCIAL PERFORMANCE TRENDS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#224636" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#224636" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cba358" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#cba358" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'Inter',
                }}
                formatter={(value: any) => [
                  formatCurrency(Number(value || 0)),
                  '',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue"
                stroke="#224636"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#cba358"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
