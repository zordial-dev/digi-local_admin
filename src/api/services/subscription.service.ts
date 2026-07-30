import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  Subscription,
  SubscriptionQueryParams,
  RenewSubscriptionPayload,
  CancelSubscriptionPayload,
  SubscriptionAnalyticsData,
} from '../../types/subscription';
import { PaginatedResponse } from '../../types/api';
import { env } from '../../env';

// Mock Subscriptions Data
let MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-801',
    vendorId: 'vnd_1',
    vendorName: 'Claire Vance',
    storeName: 'Artisan Bakery Co.',
    plan: 'enterprise',
    billingCycle: 'annual',
    price: 1990,
    startDate: '2025-12-31',
    expiryDate: '2026-12-31',
    remainingDays: 154,
    status: 'active',
    paymentStatus: 'paid',
    autoRenew: true,
    invoiceUrl: '/invoices/SUB-801.pdf',
    history: [
      { id: 'h_1', action: 'Subscription Upgraded', date: '2025-12-31', amount: 1990, details: 'Upgraded from Pro to Enterprise Annual Plan' },
      { id: 'h_2', action: 'Initial Registration', date: '2025-01-15', amount: 490, details: 'Pro Monthly Plan initiated' },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z',
  },
  {
    id: 'SUB-802',
    vendorId: 'vnd_2',
    vendorName: 'David Zhang',
    storeName: 'GreenThumb Organics',
    plan: 'pro',
    billingCycle: 'monthly',
    price: 49,
    startDate: '2026-07-05',
    expiryDate: '2026-08-05',
    remainingDays: 6,
    status: 'expiring_soon',
    paymentStatus: 'paid',
    autoRenew: true,
    invoiceUrl: '/invoices/SUB-802.pdf',
    history: [
      { id: 'h_3', action: 'Monthly Renewal', date: '2026-07-05', amount: 49, details: 'Pro Monthly Plan renewed successfully' },
    ],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-07-05T00:00:00Z',
  },
  {
    id: 'SUB-803',
    vendorId: 'vnd_3',
    vendorName: 'Marcus Bell',
    storeName: 'Metro Pottery Works',
    plan: 'free',
    billingCycle: 'monthly',
    price: 0,
    startDate: '2026-03-01',
    expiryDate: '2026-07-01',
    remainingDays: 0,
    status: 'overdue',
    paymentStatus: 'overdue',
    autoRenew: false,
    invoiceUrl: '/invoices/SUB-803.pdf',
    history: [
      { id: 'h_4', action: 'Payment Overdue', date: '2026-07-02', amount: 0, details: 'Subscription marked overdue after 0 remaining days' },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-07-02T00:00:00Z',
  },
  {
    id: 'SUB-804',
    vendorId: 'vnd_4',
    vendorName: 'Elena Rostova',
    storeName: 'Botanical Bloom Co.',
    plan: 'pro',
    billingCycle: 'annual',
    price: 490,
    startDate: '2026-04-10',
    expiryDate: '2026-07-10',
    remainingDays: 0,
    status: 'cancelled',
    paymentStatus: 'paid',
    autoRenew: false,
    invoiceUrl: '/invoices/SUB-804.pdf',
    history: [
      { id: 'h_5', action: 'Subscription Cancelled', date: '2026-07-10', amount: 0, details: 'Cancelled by admin request' },
    ],
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
  },
];

const MOCK_ANALYTICS: SubscriptionAnalyticsData = {
  activeSubscriptions: 980,
  expiringSoonCount: 42,
  overdueCount: 18,
  monthlyRecurringRevenue: 58450,
  planDistribution: [
    { name: 'Enterprise', count: 320, mrr: 38400, color: '#224636' },
    { name: 'Pro Vendor', count: 480, mrr: 20050, color: '#cba358' },
    { name: 'Free Starter', count: 180, mrr: 0, color: '#827973' },
  ],
};

class SubscriptionService extends BaseApiService {
  constructor() {
    super(apiClient, '/subscriptions');
  }

  public async getSubscriptions(params?: SubscriptionQueryParams): Promise<PaginatedResponse<Subscription>> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let list = [...MOCK_SUBSCRIPTIONS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.storeName.toLowerCase().includes(query) ||
            s.vendorName.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
        );
      }

      if (params?.status && params.status !== 'all') {
        list = list.filter((s) => s.status === params.status);
      }

      if (params?.plan && params.plan !== 'all') {
        list = list.filter((s) => s.plan === params.plan);
      }

      if (params?.billingCycle && params.billingCycle !== 'all') {
        list = list.filter((s) => s.billingCycle === params.billingCycle);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedItems = list.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        meta: {
          page,
          limit,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / limit) || 1,
          hasNextPage: page * limit < list.length,
          hasPrevPage: page > 1,
        },
      };
    }

    return this.getPaginated<Subscription>('', params);
  }

  public async getSubscriptionById(id: string): Promise<Subscription> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      const found = MOCK_SUBSCRIPTIONS.find((s) => s.id === id);
      if (!found) throw new Error('Subscription not found');
      return found;
    }
    return this.get<Subscription>(`/${id}`);
  }

  public async getSubscriptionAnalytics(): Promise<SubscriptionAnalyticsData> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_ANALYTICS;
    }
    return this.get<SubscriptionAnalyticsData>('/analytics');
  }

  public async renewSubscription(payload: RenewSubscriptionPayload): Promise<Subscription> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      let updated: Subscription | null = null;
      MOCK_SUBSCRIPTIONS = MOCK_SUBSCRIPTIONS.map((s) => {
        if (s.id === payload.subscriptionId) {
          const newPrice = payload.plan === 'enterprise' ? 199 : payload.plan === 'pro' ? 49 : 0;
          updated = {
            ...s,
            plan: payload.plan,
            billingCycle: payload.billingCycle,
            price: payload.billingCycle === 'annual' ? newPrice * 10 : newPrice,
            status: 'active',
            paymentStatus: 'paid',
            remainingDays: payload.billingCycle === 'annual' ? 365 : 30,
            autoRenew: payload.autoRenew,
            updatedAt: new Date().toISOString(),
            history: [
              {
                id: `h_${Date.now()}`,
                action: 'Subscription Renewed',
                date: new Date().toISOString().split('T')[0],
                amount: payload.billingCycle === 'annual' ? newPrice * 10 : newPrice,
                details: `Renewed to ${payload.plan} (${payload.billingCycle})`,
              },
              ...s.history,
            ],
          };
          return updated;
        }
        return s;
      });
      if (!updated) throw new Error('Subscription not found');
      return updated;
    }
    return this.post<Subscription, RenewSubscriptionPayload>(`/${payload.subscriptionId}/renew`, payload);
  }

  public async cancelSubscription(payload: CancelSubscriptionPayload): Promise<Subscription> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      let updated: Subscription | null = null;
      MOCK_SUBSCRIPTIONS = MOCK_SUBSCRIPTIONS.map((s) => {
        if (s.id === payload.subscriptionId) {
          updated = {
            ...s,
            status: 'cancelled',
            autoRenew: false,
            updatedAt: new Date().toISOString(),
            history: [
              {
                id: `h_${Date.now()}`,
                action: 'Subscription Cancelled',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                details: `Reason: ${payload.reason}`,
              },
              ...s.history,
            ],
          };
          return updated;
        }
        return s;
      });
      if (!updated) throw new Error('Subscription not found');
      return updated;
    }
    return this.post<Subscription, CancelSubscriptionPayload>(`/${payload.subscriptionId}/cancel`, payload);
  }

  public async downloadInvoice(id: string): Promise<string> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return `/invoices/${id}.pdf`;
    }
    return this.get<string>(`/${id}/invoice`);
  }
}

export const subscriptionService = new SubscriptionService();
