import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { NotificationMenu } from '../../components/dashboard/NotificationMenu';
import { Button } from '../../components/ui/Button';

export interface NavbarProps {
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left Section: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {onOpenMobileSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            className="md:hidden text-[var(--foreground)]"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Breadcrumbs />
      </div>

      {/* Right Section: Quick Search, Theme, Notifications & User Menu */}
      <div className="flex items-center gap-3">
        {/* Command Search Trigger */}
        <button
          type="button"
          onClick={() => {}}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] hover:border-[var(--gold)] transition cursor-pointer font-body"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search records...</span>
          <kbd className="ml-4 font-mono text-[10px] bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Component */}
        <NotificationMenu />

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-5 w-px bg-[var(--border)] mx-1" />

        {/* User Profile Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
