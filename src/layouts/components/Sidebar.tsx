import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  Bell,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigationGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Reports & Analytics', path: '/dashboard/analytics', icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Societies', path: '/dashboard/societies', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Users & Vendors', path: '/dashboard/users', icon: <Users className="h-4 w-4" /> },
        { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Payments & Payouts', path: '/dashboard/payments', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Architecture Specs', path: '/dashboard/architecture', icon: <Layers className="h-4 w-4" /> },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Notifications Feed', path: '/dashboard/notifications', icon: <Bell className="h-4 w-4" /> },
        { label: 'Security & Audit Logs', path: '/dashboard/security', icon: <ShieldCheck className="h-4 w-4" />, badge: 'Audit' },
        { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[var(--border)] bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--border)]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--gold)] flex items-center justify-center font-serif font-bold text-base">
              DL
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-[var(--foreground)] tracking-tight">
                DigiLocal
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--gold)] font-semibold">
                Admin Panel
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto h-8 w-8 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--gold)] flex items-center justify-center font-serif font-bold text-base">
            DL
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {!isCollapsed && (
              <h5 className="px-3 font-mono-meta text-[10px] font-semibold text-[var(--muted-foreground)] mb-2">
                {group.title}
              </h5>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium font-body transition-all duration-150',
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold border-l-2 border-[var(--gold)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--gold)]',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="font-mono text-[9px] bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/40 px-1.5 py-0.5 rounded font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[var(--border)] flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
