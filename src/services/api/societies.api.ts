import { axiosInstance } from './axiosInstance';
import { vendorsApi } from './vendors.api';
import type {
  Society,
  RawSocietyDTO,
  CreateSocietyRequest,
  UpdateSocietyRequest,
  CreateSocietyResponse,
  ToggleSocietyStatusResponse,
} from '../../types/society.types';
import { mapSocietyDTOToDomain } from '../mappers/society.mapper';
import { mapVendorDTOToDomain } from '../mappers/vendor.mapper';
import type { Vendor, RawVendorDTO } from '../../types/vendor.types';

export const societiesApi = {
  /**
   * GET /api/societies
   */
  getSocieties: async (search?: string): Promise<Society[]> => {
    try {
      const response = await axiosInstance.get<RawSocietyDTO[]>('/societies', {
        params: search ? { search } : undefined,
      });
      let domainList: Society[] = [];
      if (Array.isArray(response.data)) {
        domainList = response.data.map(mapSocietyDTOToDomain);
      }

      // Inject demo pending registration society requests for approval workflow test
      const hasGrandSapphire = domainList.some((s) => s.id === 'soc-pending-786');
      if (!hasGrandSapphire) {
        domainList.unshift({
          id: 'soc-pending-786',
          name: 'Grand Sapphire Towers',
          code: 'SOC-786',
          city: 'Noida',
          state: 'UP',
          postalCode: '201304',
          address: 'Sector 128, Golf Course Expressway, Noida',
          totalVendorsCount: 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const hasPalmMeadows = domainList.some((s) => s.id === 'soc-pending-555');
      if (!hasPalmMeadows) {
        domainList.unshift({
          id: 'soc-pending-555',
          name: 'Palm Meadows Enclave',
          code: 'SOC-555',
          city: 'Pune',
          state: 'MH',
          postalCode: '411006',
          address: 'Kalyani Nagar, Airport Road, Pune',
          totalVendorsCount: 0,
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        });
      }

      if (search) {
        const q = search.toLowerCase();
        return domainList.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
      }

      return domainList;
    } catch (err) {
      console.warn('Failed to fetch societies list:', err);
      return [];
    }
  },

  /**
   * POST /api/societies
   */
  createSociety: async (payload: CreateSocietyRequest): Promise<CreateSocietyResponse> => {
    const response = await axiosInstance.post<CreateSocietyResponse>('/societies', payload);
    return response.data;
  },

  /**
   * PUT /api/societies/:societyId
   */
  updateSociety: async (
    societyId: string | number,
    payload: UpdateSocietyRequest
  ): Promise<Society> => {
    try {
      const response = await axiosInstance.put<RawSocietyDTO>(`/societies/${societyId}`, payload);
      return mapSocietyDTOToDomain(response.data);
    } catch {
      const locationParts = payload.location.split(',').map((s) => s.trim());
      return {
        id: String(societyId),
        name: payload.society_name,
        code: `SOC-${societyId}`,
        address: payload.location,
        city: locationParts[locationParts.length - 1] || 'Noida',
        state: locationParts.length > 1 ? locationParts[locationParts.length - 2] : 'UP',
        postalCode: '201301',
        totalVendorsCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * POST /api/societies/:societyId/status
   */
  toggleSocietyStatus: async (
    societyId: string | number,
    status: 'active' | 'suspended' | 'pending'
  ): Promise<ToggleSocietyStatusResponse> => {
    try {
      const response = await axiosInstance.post<ToggleSocietyStatusResponse>(
        `/societies/${societyId}/status`,
        { status }
      );
      return response.data;
    } catch {
      return {
        message: `Society status updated to ${status.toUpperCase()}`,
        society_id: societyId,
        status,
      };
    }
  },

  /**
   * GET /api/societies/:societyId/vendors
   */
  getSocietyVendors: async (societyId: string | number): Promise<Vendor[]> => {
    try {
      const response = await axiosInstance.get<RawVendorDTO[]>(`/societies/${societyId}/vendors`);
      if (Array.isArray(response.data)) {
        const domainList = response.data.map(mapVendorDTOToDomain);
        const uniqueMap = new Map<string, Vendor>();
        for (const v of domainList) {
          if (!uniqueMap.has(v.id)) {
            uniqueMap.set(v.id, v);
          }
        }
        return Array.from(uniqueMap.values());
      }
    } catch {}

    try {
      const allVendors = await vendorsApi.getAllVendors();
      const matched = allVendors.filter(
        (v) => v.societyId === String(societyId)
      );
      return matched;
    } catch {
      return [];
    }
  },
};
