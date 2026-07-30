import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  UserCheck,
  ShieldCheck,
  Mail,
  FileCheck,
  CreditCard,
  Sliders,
  Bell,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { usePlatformSettings } from '../../hooks/useSettings';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/feedback/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { AdminProfileTab } from '../../components/settings/AdminProfileTab';
import { SecurityTab } from '../../components/settings/SecurityTab';
import { EmailSettingsTab } from '../../components/settings/EmailSettingsTab';
import { TaxSettingsTab } from '../../components/settings/TaxSettingsTab';
import { SubscriptionPlansTab } from '../../components/settings/SubscriptionPlansTab';
import { SystemSettingsTab } from '../../components/settings/SystemSettingsTab';
import { NotificationPreferencesTab } from '../../components/settings/NotificationPreferencesTab';
import { BrandingTab } from '../../components/settings/BrandingTab';

export type SettingsTabId =
  | 'profile'
  | 'security'
  | 'email'
  | 'tax'
  | 'plans'
  | 'system'
  | 'notifications'
  | 'branding';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
  const { data, isLoading, isError, refetch } = usePlatformSettings();

  const tabs: Array<{ id: SettingsTabId; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Admin Profile', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'security', label: 'Security & Password', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'email', label: 'Email & SMTP', icon: <Mail className="h-4 w-4" /> },
    { id: 'tax', label: 'Tax & GST', icon: <FileCheck className="h-4 w-4" /> },
    { id: 'plans', label: 'Subscription Plans', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'system', label: 'System Parameters', icon: <Sliders className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'branding', label: 'Branding & Logo', icon: <Palette className="h-4 w-4" /> },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Settings"
          description="There was a problem retrieving platform configuration parameters. Please check your connection and retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              SYSTEM CONFIGURATION
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Platform Settings
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Configure system parameters, security policies, SMTP servers, GST rules, pricing tiers, and brand assets.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Reload Config
        </Button>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)] scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono-meta font-semibold shrink-0 transition cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--gold)] shadow-xs'
                : 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Sub-Module Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="pt-2">
          {activeTab === 'profile' && <AdminProfileTab data={data?.profile} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'email' && <EmailSettingsTab data={data?.email} />}
          {activeTab === 'tax' && <TaxSettingsTab data={data?.tax} />}
          {activeTab === 'plans' && <SubscriptionPlansTab data={data?.plans} />}
          {activeTab === 'system' && <SystemSettingsTab data={data?.system} />}
          {activeTab === 'notifications' && <NotificationPreferencesTab data={data?.notifications} />}
          {activeTab === 'branding' && <BrandingTab data={data?.branding} />}
        </div>
      )}
    </div>
  );
};
