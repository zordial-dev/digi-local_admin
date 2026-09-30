import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  Download,
  AlertTriangle,
  Store,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import type { Subscription } from '../../types/subscription.types';
import { useDownloadInvoice } from '../../hooks/useSubscriptions';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import { Input } from '../common/Input/Input';

export interface SubscriptionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onCancelClick?: (subscription: Subscription, reason: string) => void;
  isCancelling?: boolean;
  onUnblockClick?: (subscription: Subscription) => void;
  isUnblocking?: boolean;
}

export const SubscriptionDetailsDrawer: React.FC<SubscriptionDetailsDrawerProps> = ({
  isOpen,
  onClose,
  subscription,
  onCancelClick,
  isCancelling,
  onUnblockClick,
  isUnblocking,
}) => {
  const downloadInvoiceMutation = useDownloadInvoice();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !subscription) return null;

  const isBlocked = subscription.isVendorBlocked || subscription.status === 'suspended' || subscription.status === 'blocked';
  const hasActiveSub = subscription.daysRemaining > 0;
  const isPending = subscription.status === 'pending' || subscription.vendorStatus === 'pending';
  
  let statusBadge: React.ReactNode;
  if (isPending) {
    statusBadge = <Badge variant="warning">PENDING APPROVAL</Badge>;
  } else if (isBlocked && hasActiveSub) {
    statusBadge = <Badge variant="warning">BLOCKED (ACTIVE SUB)</Badge>;
  } else if (isBlocked) {
    statusBadge = <Badge variant="danger">STORE BLOCKED</Badge>;
  } else if (hasActiveSub) {
    statusBadge = <Badge variant="success">SUBSCRIBED</Badge>;
  } else {
    statusBadge = <Badge variant="secondary">EXPIRED</Badge>;
  }

  const handleCancel = () => {
    if (onCancelClick) {
      onCancelClick(subscription, cancelReason);
      setShowCancelConfirm(false);
      setCancelReason('');
    }
  };

  const handleClose = () => {
    setShowCancelConfirm(false);
    setCancelReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#211A19]/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-[#FCFAF8] border-l border-[#E7DFD5] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-[#E7DFD5]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[#224636] text-white border border-[#C8A878] flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-2xl text-[#211A19] leading-tight">{subscription.storeName}</h3>
                    {statusBadge}
                  </div>
                  <p className="font-mono text-xs text-[#78716C] mt-0.5">
                    Sub ID: {subscription.id} • Vendor ID: {subscription.vendorId}
                  </p>
                </div>
              </div>

              <button 
                className="p-1.5 rounded-full hover:bg-[#E7DFD5] text-[#211A19] transition-colors" 
                onClick={handleClose} 
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overview Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
              <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] shadow-xs">
                <span className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-wider">PLAN TIER</span>
                <div className="mt-1 font-serif text-2xl font-bold text-[#224636] capitalize">
                  {subscription.tier}
                </div>
                <span className="font-mono text-[10px] text-[#C8A878] capitalize">
                  {formatCurrency(subscription.price)} / mo
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] shadow-xs">
                <span className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-wider">REMAINING DAYS</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-3xl font-bold text-[#C8A878]">
                    {subscription.daysRemaining}
                  </span>
                  <span className="text-xs text-[#78716C]">days</span>
                </div>
                {subscription.daysRemaining <= 15 && (
                  <span className="font-mono text-[9px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> Expiring soon
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7DFD5] shadow-xs">
                <span className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-wider">OWNER</span>
                <div className="mt-1 font-sans text-sm font-semibold text-[#211A19]">
                  {subscription.ownerName}
                </div>
                <span className="font-sans text-[11px] text-[#78716C] block mt-1 truncate" title={subscription.societyName}>
                  {subscription.societyName}
                </span>
              </div>
            </div>

            {/* Invoice & Plan Details */}
            <div className="p-5 rounded-xl bg-white border border-[#E7DFD5] shadow-xs space-y-4 mb-6">
              <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3">
                <h4 className="font-serif font-bold text-lg text-[#211A19] flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#C8A878]" />
                  <span>Subscription Status & Billing</span>
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  isLoading={downloadInvoiceMutation.isPending}
                  onClick={() => downloadInvoiceMutation.mutate(subscription.id)}
                >
                  Download Invoice
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FAF8F5] rounded-lg">
                    <Calendar className="h-4 w-4 text-[#C8A878]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase font-mono">Start Date</span>
                    <span className="text-sm font-medium text-[#211A19]">{formatDate(subscription.startDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FAF8F5] rounded-lg">
                    <Clock className="h-4 w-4 text-[#C8A878]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase font-mono">Renewal Date</span>
                    <span className="text-sm font-medium text-[#211A19]">{formatDate(subscription.renewalDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#ECFDF5] rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase font-mono">Status</span>
                    <span className="text-sm font-medium text-[#211A19] capitalize">{subscription.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone / Unblock Zone */}
            {hasActiveSub && !isBlocked && (
              <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 shadow-xs space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-lg text-rose-900 flex items-center gap-2">
                    <Ban className="h-5 w-5 text-rose-600" />
                    <span>Danger Zone</span>
                  </h4>
                </div>
                <p className="text-sm text-rose-800">
                  Blocking or cancelling this subscription will instantly revoke the vendor's access to premium features. They will remain registered but downgraded.
                </p>

                {showCancelConfirm ? (
                  <div className="space-y-3 bg-white p-4 rounded-lg border border-rose-100">
                    <label className="block text-xs font-bold text-rose-900 uppercase">Reason for Cancellation</label>
                    <Input
                      placeholder="e.g. Terms violation, payment dispute..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleCancel}
                        disabled={!cancelReason.trim() || isCancelling}
                        isLoading={isCancelling}
                      >
                        Confirm Cancellation
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            )}

            {isBlocked && (
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 shadow-xs space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-lg text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Blocked Subscription</span>
                  </h4>
                </div>
                <p className="text-sm text-amber-800">
                  This subscription is currently blocked/suspended. You can unblock it to restore the vendor's premium access.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onUnblockClick && onUnblockClick(subscription)}
                  isLoading={isUnblocking}
                >
                  Unblock Subscription
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#E7DFD5] flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
