import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  Vendor,
  VendorQueryParams,
  VendorPayment,
  CreateVendorPayload,
  UpdateVendorPayload,
  BulkVendorActionPayload,
  VendorStatus,
} from '../../types/vendor';
import { PaginatedResponse } from '../../types/api';
import { env } from '../../env';

// Mock Vendors Data
let MOCK_VENDORS: Vendor[] = [
  {
    id: 'vnd_1',
    storeName: 'Artisan Bakery Co.',
    ownerName: 'Claire Vance',
    category: 'Bakery & Food',
    email: 'claire@artisanbakery.com',
    phone: '+1 (555) 234-5678',
    website: 'https://artisanbakery.com',
    address: 'Shop 4, Greenwood Heights',
    societyName: 'Greenwood Heights Society',
    gstin: '22ABCDE1234F1Z5',
    businessType: 'Private Limited',
    subscriptionTier: 'enterprise',
    subscriptionRenewalDate: '2026-12-31',
    status: 'active',
    totalEarnings: 84500,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    businessHours: [
      { day: 'Monday', openTime: '07:00', closeTime: '20:00', isClosed: false },
      { day: 'Tuesday', openTime: '07:00', closeTime: '20:00', isClosed: false },
      { day: 'Wednesday', openTime: '07:00', closeTime: '20:00', isClosed: false },
      { day: 'Thursday', openTime: '07:00', closeTime: '20:00', isClosed: false },
      { day: 'Friday', openTime: '07:00', closeTime: '21:00', isClosed: false },
      { day: 'Saturday', openTime: '08:00', closeTime: '21:00', isClosed: false },
      { day: 'Sunday', openTime: '08:00', closeTime: '18:00', isClosed: false },
    ],
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-07-28T14:30:00Z',
  },
  {
    id: 'vnd_2',
    storeName: 'GreenThumb Organics',
    ownerName: 'David Zhang',
    category: 'Grocery',
    email: 'david@greenthumb.org',
    phone: '+1 (555) 345-6789',
    website: 'https://greenthumb.org',
    address: 'Shop 12, Riverside Hub',
    societyName: 'Riverside Community Hub',
    gstin: '27FGHIJ5678K1Z2',
    businessType: 'LLP',
    subscriptionTier: 'pro',
    subscriptionRenewalDate: '2026-10-15',
    status: 'active',
    totalEarnings: 42100,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    businessHours: [
      { day: 'Monday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Tuesday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Wednesday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Thursday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Friday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Saturday', openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: 'Sunday', openTime: '09:00', closeTime: '14:00', isClosed: false },
    ],
    createdAt: '2026-02-15T11:20:00Z',
    updatedAt: '2026-07-25T10:15:00Z',
  },
  {
    id: 'vnd_3',
    storeName: 'Metro Pottery Works',
    ownerName: 'Marcus Bell',
    category: 'Home & Living',
    email: 'marcus@metropottery.com',
    phone: '+1 (555) 456-7890',
    address: 'Unit 3, Oakridge Enclave',
    societyName: 'Oakridge Residential Enclave',
    gstin: '33KLMNO9012P1Z8',
    businessType: 'Sole Proprietorship',
    subscriptionTier: 'free',
    subscriptionRenewalDate: '2026-08-30',
    status: 'suspended',
    totalEarnings: 12400,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    businessHours: [
      { day: 'Monday', openTime: '10:00', closeTime: '18:00', isClosed: false },
      { day: 'Tuesday', openTime: '10:00', closeTime: '18:00', isClosed: false },
      { day: 'Wednesday', openTime: '10:00', closeTime: '18:00', isClosed: false },
      { day: 'Thursday', openTime: '10:00', closeTime: '18:00', isClosed: false },
      { day: 'Friday', openTime: '10:00', closeTime: '18:00', isClosed: false },
      { day: 'Saturday', openTime: '10:00', closeTime: '16:00', isClosed: false },
      { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
    ],
    createdAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-06-18T12:00:00Z',
  },
  {
    id: 'vnd_4',
    storeName: 'Botanical Bloom Co.',
    ownerName: 'Elena Rostova',
    category: 'Florist & Decor',
    email: 'elena@botanicalbloom.com',
    phone: '+1 (555) 567-8901',
    address: 'Suite 8, Harbor View Colony',
    societyName: 'Harbor View Gated Colony',
    gstin: '19QRSTU3456V1Z4',
    businessType: 'Partnership',
    subscriptionTier: 'pro',
    subscriptionRenewalDate: '2026-11-20',
    status: 'pending_approval',
    totalEarnings: 5800,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    businessHours: [
      { day: 'Monday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Tuesday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Wednesday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Thursday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Friday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Saturday', openTime: '09:00', closeTime: '19:00', isClosed: false },
      { day: 'Sunday', openTime: '09:00', closeTime: '15:00', isClosed: false },
    ],
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
];

const MOCK_VENDOR_PAYMENTS: Record<string, VendorPayment[]> = {
  vnd_1: [
    { id: 'PAY-701', amount: 2450, date: '2026-07-25', status: 'completed', paymentMethod: 'Stripe Direct', invoiceUrl: '#' },
    { id: 'PAY-702', amount: 3100, date: '2026-06-25', status: 'completed', paymentMethod: 'Stripe Direct', invoiceUrl: '#' },
    { id: 'PAY-703', amount: 2800, date: '2026-05-25', status: 'completed', paymentMethod: 'Stripe Direct', invoiceUrl: '#' },
  ],
  vnd_2: [
    { id: 'PAY-704', amount: 1450, date: '2026-07-20', status: 'completed', paymentMethod: 'Bank Transfer', invoiceUrl: '#' },
    { id: 'PAY-705', amount: 1600, date: '2026-06-20', status: 'completed', paymentMethod: 'Bank Transfer', invoiceUrl: '#' },
  ],
};

class VendorService extends BaseApiService {
  constructor() {
    super(apiClient, '/vendors');
  }

  public async getVendors(params?: VendorQueryParams): Promise<PaginatedResponse<Vendor>> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let list = [...MOCK_VENDORS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (v) =>
            v.storeName.toLowerCase().includes(query) ||
            v.ownerName.toLowerCase().includes(query) ||
            v.gstin.toLowerCase().includes(query) ||
            v.category.toLowerCase().includes(query)
        );
      }

      if (params?.status && params.status !== 'all') {
        list = list.filter((v) => v.status === params.status);
      }

      if (params?.tier && params.tier !== 'all') {
        list = list.filter((v) => v.subscriptionTier === params.tier);
      }

      if (params?.category) {
        list = list.filter((v) => v.category.toLowerCase() === params.category?.toLowerCase());
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

    return this.getPaginated<Vendor>('', params);
  }

  public async getVendorById(id: string): Promise<Vendor> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      const found = MOCK_VENDORS.find((v) => v.id === id);
      if (!found) throw new Error('Vendor not found');
      return found;
    }
    return this.get<Vendor>(`/${id}`);
  }

  public async getVendorPayments(id: string): Promise<VendorPayment[]> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return (
        MOCK_VENDOR_PAYMENTS[id] || [
          { id: `PAY_MOCK_${id}`, amount: 950, date: '2026-07-01', status: 'completed', paymentMethod: 'Stripe Direct' },
        ]
      );
    }
    return this.get<VendorPayment[]>(`/${id}/payments`);
  }

  public async createVendor(payload: CreateVendorPayload): Promise<Vendor> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      const newVendor: Vendor = {
        id: `vnd_${Date.now()}`,
        ...payload,
        subscriptionRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        totalEarnings: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        businessHours: [
          { day: 'Monday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Tuesday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Wednesday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Thursday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Friday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Saturday', openTime: '09:00', closeTime: '19:00', isClosed: false },
          { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_VENDORS = [newVendor, ...MOCK_VENDORS];
      return newVendor;
    }
    return this.post<Vendor, CreateVendorPayload>('', payload);
  }

  public async updateVendor(id: string, payload: UpdateVendorPayload): Promise<Vendor> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let updated: Vendor | null = null;
      MOCK_VENDORS = MOCK_VENDORS.map((v) => {
        if (v.id === id) {
          updated = { ...v, ...payload, updatedAt: new Date().toISOString() };
          return updated;
        }
        return v;
      });
      if (!updated) throw new Error('Vendor not found');
      return updated;
    }
    return this.put<Vendor, UpdateVendorPayload>(`/${id}`, payload);
  }

  public async deleteVendor(id: string): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_VENDORS = MOCK_VENDORS.filter((v) => v.id !== id);
      return;
    }
    return this.delete<void>(`/${id}`);
  }

  public async toggleVendorStatus(id: string, status: VendorStatus): Promise<Vendor> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return this.updateVendor(id, { status });
    }
    return this.patch<Vendor, { status: string }>(`/${id}/status`, { status });
  }

  public async bulkVendorAction(payload: BulkVendorActionPayload): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      if (payload.action === 'delete') {
        MOCK_VENDORS = MOCK_VENDORS.filter((v) => !payload.ids.includes(v.id));
      } else {
        const newStatus: VendorStatus = payload.action === 'activate' ? 'active' : 'suspended';
        MOCK_VENDORS = MOCK_VENDORS.map((v) =>
          payload.ids.includes(v.id) ? { ...v, status: newStatus, updatedAt: new Date().toISOString() } : v
        );
      }
      return;
    }
    return this.post<void, BulkVendorActionPayload>('/bulk-action', payload);
  }
}

export const vendorService = new VendorService();
