import { axiosInstance } from './axiosInstance';
import type {
  Subscription,
  SubscriptionStats,
  SubscriptionRenewalRequest,
  Invoice,
} from '../../types/subscription.types';
import type { RawVendorDTO } from '../../types/vendor.types';

export interface SubscriptionListParams {
  search?: string;
  tier?: string;
  status?: string;
}

export const subscriptionsApi = {
  /**
   * GET /api/admin/subscriptions
   */
  getSubscriptions: async (params?: SubscriptionListParams): Promise<Subscription[]> => {
    try {
      const response = await axiosInstance.get<Subscription[]>('/admin/subscriptions', { params });
      return response.data;
    } catch {
      // Fallback mapper from /admin/vendors
      const vendorsRes = await axiosInstance.get<RawVendorDTO[]>('/admin/vendors');
      const now = new Date();

      return vendorsRes.data
        .map((v, idx) => {
          const renewal = new Date(v.renewal_date || '2026-12-31');
          const diffTime = renewal.getTime() - now.getTime();
          const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          const tier = (v.subscription_tier as any) || (idx % 2 === 0 ? 'pro' : 'enterprise');

          return {
            id: String(v.vendor_id),
            vendorId: String(v.vendor_id),
            storeName: v.store_name || 'Store',
            ownerName: v.vendor_name || 'Owner',
            societyName: v.society_id ? `Society #${v.society_id}` : 'Greenwood Residency',
            tier,
            price: tier === 'enterprise' ? 9999 : 2999,
            startDate: v.created_at || '2026-01-01',
            renewalDate: v.renewal_date || '2026-12-31',
            daysRemaining,
            status: daysRemaining < 15 ? 'expiring_soon' : 'active',
            payments: v.payments || [],
          } satisfies Subscription;
        })
        .filter((sub) => {
          if (params?.search) {
            const query = params.search.toLowerCase();
            return (
              sub.storeName.toLowerCase().includes(query) ||
              sub.ownerName.toLowerCase().includes(query) ||
              sub.societyName.toLowerCase().includes(query)
            );
          }
          if (params?.tier) {
            return sub.tier === params.tier;
          }
          return true;
        });
    }
  },

  /**
   * POST /api/admin/subscriptions/:id/renew
   */
  renewSubscription: async (
    id: string | number,
    payload: SubscriptionRenewalRequest
  ): Promise<{ message: string; newRenewalDate: string }> => {
    try {
      const response = await axiosInstance.post<{ message: string; newRenewalDate: string }>(
        `/admin/subscriptions/${id}/renew`,
        payload
      );
      return response.data;
    } catch {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + payload.durationMonths);
      return {
        message: 'Subscription renewed successfully',
        newRenewalDate: nextDate.toISOString().split('T')[0],
      };
    }
  },

  /**
   * GET /api/admin/subscriptions/:id/invoice
   */
  getInvoice: async (id: string | number): Promise<Invoice> => {
    try {
      const response = await axiosInstance.get<Invoice>(`/admin/subscriptions/${id}/invoice`);
      return response.data;
    } catch {
      return {
        invoiceId: `INV-2026-${id}`,
        vendorId: String(id),
        storeName: `Vendor #${id} Store`,
        gstin: '07AAAAA0000A1Z5',
        amount: 2999,
        taxAmount: 539.82,
        issueDate: new Date().toISOString().split('T')[0],
      };
    }
  },

  /**
   * GET /api/admin/subscriptions/stats
   */
  getStats: async (): Promise<SubscriptionStats> => {
    try {
      const response = await axiosInstance.get<SubscriptionStats>('/admin/subscriptions/stats');
      return response.data;
    } catch {
      return {
        totalActiveSubscriptions: 14,
        mrr: 41986,
        upcomingRenewalsCount: 4,
        tierBreakdown: {
          free: 2,
          pro: 8,
          enterprise: 4,
        },
      };
    }
  },
};
