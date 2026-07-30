import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  Society,
  SocietyQueryParams,
  SocietyVendor,
  CreateSocietyPayload,
  UpdateSocietyPayload,
  BulkSocietyActionPayload,
} from '../../types/society';
import { PaginatedResponse } from '../../types/api';
import { env } from '../../env';

// Mock Societies Data
let MOCK_SOCIETIES: Society[] = [
  { id: 'soc_1', name: 'Greenwood Heights Society', code: 'SOC-GWH-01', city: 'Metropolis', state: 'NY', postalCode: '10001', address: '450 Greenwood Ave', totalVendorsCount: 42, status: 'active', createdAt: '2026-01-15T08:30:00Z', updatedAt: '2026-07-20T14:10:00Z' },
  { id: 'soc_2', name: 'Riverside Community Hub', code: 'SOC-RVS-02', city: 'Metropolis', state: 'NY', postalCode: '10002', address: '120 Riverside Drive', totalVendorsCount: 28, status: 'active', createdAt: '2026-02-10T10:15:00Z', updatedAt: '2026-07-22T09:30:00Z' },
  { id: 'soc_3', name: 'Oakridge Residential Enclave', code: 'SOC-OAK-03', city: 'Springfield', state: 'IL', postalCode: '62701', address: '78 Oakridge Parkway', totalVendorsCount: 15, status: 'inactive', createdAt: '2026-03-05T11:00:00Z', updatedAt: '2026-06-12T16:45:00Z' },
  { id: 'soc_4', name: 'Harbor View Gated Colony', code: 'SOC-HVR-04', city: 'San Jose', state: 'CA', postalCode: '95110', address: '990 Harbor View Blvd', totalVendorsCount: 64, status: 'active', createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-07-25T11:20:00Z' },
  { id: 'soc_5', name: 'Sunset Meadow Residency', code: 'SOC-SST-05', city: 'Springfield', state: 'IL', postalCode: '62704', address: '310 Sunset Meadow Way', totalVendorsCount: 9, status: 'inactive', createdAt: '2026-05-18T14:20:00Z', updatedAt: '2026-07-01T08:00:00Z' },
];

const MOCK_SOCIETY_VENDORS: Record<string, SocietyVendor[]> = {
  soc_1: [
    { id: 'v_101', storeName: 'Artisan Bakery Co.', ownerName: 'Claire Vance', category: 'Bakery & Food', email: 'claire@artisanbakery.com', phone: '+1 (555) 234-5678', status: 'active', joinedDate: '2026-02-01' },
    { id: 'v_102', storeName: 'GreenThumb Organics', ownerName: 'David Zhang', category: 'Grocery', email: 'david@greenthumb.org', phone: '+1 (555) 345-6789', status: 'active', joinedDate: '2026-03-15' },
  ],
  soc_2: [
    { id: 'v_103', storeName: 'Metro Pottery Works', ownerName: 'Marcus Bell', category: 'Home & Living', email: 'marcus@metropottery.com', phone: '+1 (555) 456-7890', status: 'active', joinedDate: '2026-04-10' },
  ],
};

class SocietyService extends BaseApiService {
  constructor() {
    super(apiClient, '/societies');
  }

  public async getSocieties(params?: SocietyQueryParams): Promise<PaginatedResponse<Society>> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let list = [...MOCK_SOCIETIES];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.code.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query)
        );
      }

      if (params?.status && params.status !== 'all') {
        list = list.filter((s) => s.status === params.status);
      }

      if (params?.city) {
        list = list.filter((s) => s.city.toLowerCase() === params.city?.toLowerCase());
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

    return this.getPaginated<Society>('', params);
  }

  public async getSocietyById(id: string): Promise<Society> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      const found = MOCK_SOCIETIES.find((s) => s.id === id);
      if (!found) throw new Error('Society not found');
      return found;
    }
    return this.get<Society>(`/${id}`);
  }

  public async getSocietyVendors(id: string): Promise<SocietyVendor[]> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_SOCIETY_VENDORS[id] || [
        { id: `v_mock_${id}`, storeName: 'Sample Local Vendor', ownerName: 'John Doe', category: 'General Store', email: 'vendor@example.com', phone: '+1 555-0000', status: 'active', joinedDate: '2026-05-01' }
      ];
    }
    return this.get<SocietyVendor[]>(`/${id}/vendors`);
  }

  public async createSociety(payload: CreateSocietyPayload): Promise<Society> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      const newSoc: Society = {
        id: `soc_${Date.now()}`,
        ...payload,
        totalVendorsCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_SOCIETIES = [newSoc, ...MOCK_SOCIETIES];
      return newSoc;
    }
    return this.post<Society, CreateSocietyPayload>('', payload);
  }

  public async updateSociety(id: string, payload: UpdateSocietyPayload): Promise<Society> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let updated: Society | null = null;
      MOCK_SOCIETIES = MOCK_SOCIETIES.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...payload, updatedAt: new Date().toISOString() };
          return updated;
        }
        return s;
      });
      if (!updated) throw new Error('Society not found');
      return updated;
    }
    return this.put<Society, UpdateSocietyPayload>(`/${id}`, payload);
  }

  public async deleteSociety(id: string): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SOCIETIES = MOCK_SOCIETIES.filter((s) => s.id !== id);
      return;
    }
    return this.delete<void>(`/${id}`);
  }

  public async toggleSocietyStatus(id: string, status: 'active' | 'inactive'): Promise<Society> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return this.updateSociety(id, { status });
    }
    return this.patch<Society, { status: string }>(`/${id}/status`, { status });
  }

  public async bulkSocietyAction(payload: BulkSocietyActionPayload): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      if (payload.action === 'delete') {
        MOCK_SOCIETIES = MOCK_SOCIETIES.filter((s) => !payload.ids.includes(s.id));
      } else {
        const newStatus = payload.action === 'activate' ? 'active' : 'inactive';
        MOCK_SOCIETIES = MOCK_SOCIETIES.map((s) =>
          payload.ids.includes(s.id) ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s
        );
      }
      return;
    }
    return this.post<void, BulkSocietyActionPayload>('/bulk-action', payload);
  }
}

export const societyService = new SocietyService();
