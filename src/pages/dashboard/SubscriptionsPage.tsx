import React, { useState } from 'react';
import './SubscriptionsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable/DataTable';
import type { Column } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { StatCard } from '../../components/common/StatCard/StatCard';
import {
  useSubscriptions,
  useSubscriptionStats,
  useRenewSubscription,
  useDownloadInvoice,
} from '../../hooks/useSubscriptions';
import { useDebounce } from '../../hooks/useDebounce';
import type { Subscription } from '../../types/subscription.types';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import {
  RefreshCw,
  Calendar,
  Search,
  IndianRupee,
  CreditCard,
  FileText,
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { SubscriptionRenewalModal } from '../../components/subscriptions/SubscriptionRenewalModal';
import { SubscriptionInvoiceModal } from '../../components/subscriptions/SubscriptionInvoiceModal';

const TIER_COLORS = {
  free: '#6B7C70',
  pro: '#10B981',
  enterprise: '#18281F',
};


export const SubscriptionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data: subscriptions = [], isLoading } = useSubscriptions({
    search: debouncedSearch,
    tier: selectedTier,
  });
  const { data: stats } = useSubscriptionStats();

  const renewMutation = useRenewSubscription();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Modals state
  const [renewingSubscription, setRenewingSubscription] = useState<Subscription | null>(null);
  const [invoicingSubscription, setInvoicingSubscription] = useState<Subscription | null>(null);

  const handleConfirmRenew = (id: string | number, durationMonths: number) => {
    renewMutation.mutate(
      { id, payload: { durationMonths } },
      {
        onSuccess: () => setRenewingSubscription(null),
      }
    );
  };

  const handleDownloadInvoice = (id: string | number) => {
    downloadInvoiceMutation.mutate(id, {
      onSuccess: () => setInvoicingSubscription(null),
    });
  };

  // Recharts Chart Dataset
  const tierPieData = [
    { name: 'Pro Plan', value: stats?.tierBreakdown.pro || 8, color: TIER_COLORS.pro },
    { name: 'Enterprise Plan', value: stats?.tierBreakdown.enterprise || 4, color: TIER_COLORS.enterprise },
    { name: 'Free Tier', value: stats?.tierBreakdown.free || 2, color: TIER_COLORS.free },
  ];

  const columns: Column<Subscription>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#18281F] font-bold">{index + 1}</span>,
    },

    {
      header: 'Vendor Store',
      cell: (sub) => (

        <div className="sub-vendor-cell">
          <div className="sub-avatar-icon">
            <CreditCard size={18} />
          </div>
          <div>
            <span className="sub-store-name">{sub.storeName}</span>
            <span className="sub-society">{sub.societyName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Plan Tier',
      cell: (sub) => (
        <Badge variant={sub.tier === 'enterprise' ? 'primary' : 'success'}>
          {sub.tier.toUpperCase()} PLAN
        </Badge>
      ),
    },
    {
      header: 'Monthly Price',
      cell: (sub) => (
        <span className="price-tag">{formatCurrency(sub.price)} / mo</span>
      ),
    },
    {
      header: 'Renewal Date',
      cell: (sub) => (
        <div className="renewal-cell">
          <Calendar size={14} className="text-muted" />
          <span>{formatDate(sub.renewalDate)}</span>
        </div>
      ),
    },
    {
      header: 'Expiration Countdown',
      cell: (sub) => (
        <Badge variant={sub.daysRemaining < 15 ? 'warning' : 'info'}>
          {sub.daysRemaining} Days Remaining
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (sub) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvoicingSubscription(sub)}
            title="Preview & Download GST Tax Invoice"
            aria-label="Preview & Download GST Tax Invoice"
          >
            <FileText size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRenewingSubscription(sub)}
            title="Renew Vendor Subscription Extension"
            aria-label="Renew Vendor Subscription Extension"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      ),
    },

  ];

  return (
    <div className="subscriptions-page">
      <PageHeader
        title="Subscriptions & Financials"
        description="Monitor active subscription plans, renewal countdown timers, and issue GST tax invoices."
      />

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Active Subscriptions"
          value={stats?.totalActiveSubscriptions || subscriptions.length || 14}
          change="+3 new this month"
          isPositive={true}
          icon={<CreditCard size={22} />}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(stats?.mrr || 41986)}
          change="+18.4% MRR"
          isPositive={true}
          icon={<IndianRupee size={22} />}
        />
        <StatCard
          title="Upcoming Renewals (30 Days)"
          value={`${stats?.upcomingRenewalsCount || 4} Vendors`}
          change="Automated reminders sent"
          isPositive={true}
          icon={<Calendar size={22} />}
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Subscription Tier Distribution</h3>
              <p className="chart-subtitle">Active vendor breakdown by tier</p>
            </div>
            <Badge variant="primary">Tier Split</Badge>
          </div>
          <div className="chart-wrapper flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tierPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue by Tier (₹)</h3>
              <p className="chart-subtitle">Monthly earnings generated per plan</p>
            </div>
            <Badge variant="success">Financials</Badge>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { tier: 'Free', amount: 0 },
                  { tier: 'Pro', amount: 23992 },
                  { tier: 'Enterprise', amount: 39996 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
                <XAxis dataKey="tier" stroke="#6B7C70" fontSize={12} />
                <YAxis stroke="#6B7C70" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E4DCC9',
                    borderRadius: '0.875rem',
                    color: '#18281F',
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Earnings']}
                />
                <Bar dataKey="amount" fill="#18281F" radius={[6, 6, 0, 0]} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="sub-control-bar glass-panel">
        <div className="flex items-center gap-3">
          <select
            className="p-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-white outline-none"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            <option value="">All Tiers</option>
            <option value="pro">Pro Plan</option>
            <option value="enterprise">Enterprise Plan</option>
            <option value="free">Free Tier</option>
          </select>

          <Input
            placeholder="Search by store name, owner, or society..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            className="search-input"
          />
        </div>
      </div>

      {/* Subscriptions Reusable DataTable */}
      <DataTable<Subscription>
        columns={columns}
        data={subscriptions}
        isLoading={isLoading}
        emptyMessage="No subscription records match your search parameters."
      />

      {/* Renewal Extension Modal */}
      <SubscriptionRenewalModal
        isOpen={!!renewingSubscription}
        onClose={() => setRenewingSubscription(null)}
        onConfirmRenew={handleConfirmRenew}
        subscription={renewingSubscription}
        isLoading={renewMutation.isPending}
      />

      {/* GST Tax Invoice Modal */}
      <SubscriptionInvoiceModal
        isOpen={!!invoicingSubscription}
        onClose={() => setInvoicingSubscription(null)}
        onDownload={handleDownloadInvoice}
        subscription={invoicingSubscription}
        isLoading={downloadInvoiceMutation.isPending}
      />
    </div>
  );
};
