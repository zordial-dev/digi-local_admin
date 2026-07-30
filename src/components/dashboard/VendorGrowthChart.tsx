import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { VendorGrowthPoint } from '../../types/dashboard';

export interface VendorGrowthChartProps {
  data?: VendorGrowthPoint[];
  isLoading?: boolean;
}

export const VendorGrowthChart: React.FC<VendorGrowthChartProps> = ({ data, isLoading }) => {
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
        <CardTitle className="text-xl">Vendor Onboarding Growth</CardTitle>
        <CardDescription>NEW VERIFIED VENDORS PER MONTH</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  `${value || 0} Vendors`,
                  'New Registrations',
                ]}
              />
              <Bar dataKey="newVendors" fill="#cba358" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
