import React from 'react';
import { StatCard } from '../common/StatCard/StatCard';
import { usePeopleAnalytics } from '../../hooks/usePeople';
import { Users, Store, ShieldAlert, Activity } from 'lucide-react';

export const PeopleAnalyticsHeader: React.FC = () => {
  const { data: analytics, isLoading } = usePeopleAnalytics();

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Directory Users"
        value={analytics.totalPeopleCount.toLocaleString()}
        subtitle="Registered resident & dual-role accounts"
        icon={<Users size={22} className="text-[#C4A066]" />}
        change="+12.4%"
        isPositive={true}
      />

      <StatCard
        title="Resident Customers"
        value={analytics.usersCount.toLocaleString()}
        subtitle="Active consumer accounts on Website"
        icon={<Activity size={22} className="text-[#D97706]" />}
        change="+8.5%"
        isPositive={true}
      />

      <StatCard
        title="User & Vendor (Dual Role)"
        value={analytics.vendorsCount.toLocaleString()}
        subtitle="Dual role customer & store owners"
        icon={<Store size={22} className="text-[#18281F]" />}
        change="+5.2%"
        isPositive={true}
      />

      <StatCard
        title="Flagged / Banned Accounts"
        value={(analytics.warnedCount + analytics.bannedCount).toLocaleString()}
        subtitle={`${analytics.bannedCount} accounts auto-banned via 3-strike meter`}
        icon={<ShieldAlert size={22} className="text-rose-500" />}
        change="+2.1%"
        isPositive={false}
      />
    </div>
  );
};
