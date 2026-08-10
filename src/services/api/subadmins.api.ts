import { axiosInstance } from './axiosInstance';
import type {
  SubAdminUser,
  CreateSubAdminRequest,
  UpdateSubAdminPowersRequest,
} from '../../types/rbac.types';

const LOCAL_STORAGE_KEY = 'digilocal_sub_admins_store';

// Mock initial dataset for Sub-Admins
const INITIAL_SUB_ADMINS: SubAdminUser[] = [
  {
    id: 'sub-1',
    name: 'Vikram Mehta',
    email: 'vikram.admin@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SOCIETIES', 'VENDORS'],
    status: 'active',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'sub-2',
    name: 'Ananya Sharma',
    email: 'ananya.finance@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SUBSCRIPTIONS'],
    status: 'active',
    createdAt: '2026-08-02T14:30:00Z',
  },
];

const getLocalSubAdmins = (): SubAdminUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SUB_ADMINS;
};

const saveLocalSubAdmins = (list: SubAdminUser[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

export const subAdminsApi = {
  /**
   * GET /api/admin/sub-admins
   */
  getSubAdmins: async (): Promise<SubAdminUser[]> => {
    try {
      const response = await axiosInstance.get<SubAdminUser[]>('/admin/sub-admins');
      if (Array.isArray(response.data) && response.data.length > 0) {
        saveLocalSubAdmins(response.data);
        return response.data;
      }
      return getLocalSubAdmins();
    } catch {
      return getLocalSubAdmins();
    }
  },

  /**
   * POST /api/admin/sub-admins
   */
  createSubAdmin: async (payload: CreateSubAdminRequest): Promise<SubAdminUser> => {
    try {
      const response = await axiosInstance.post<SubAdminUser>('/admin/sub-admins', payload);
      const current = getLocalSubAdmins();
      saveLocalSubAdmins([response.data, ...current]);
      return response.data;
    } catch {
      const newSubAdmin: SubAdminUser = {
        id: `sub-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        password: payload.password || 'password123',
        role: 'sub_admin',
        powers: payload.powers,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      const current = getLocalSubAdmins();
      const updated = [newSubAdmin, ...current];
      saveLocalSubAdmins(updated);
      return newSubAdmin;
    }
  },

  /**
   * PUT /api/admin/sub-admins/:id
   */
  updateSubAdminPowers: async (
    id: string,
    payload: UpdateSubAdminPowersRequest
  ): Promise<SubAdminUser> => {
    try {
      const response = await axiosInstance.put<SubAdminUser>(`/admin/sub-admins/${id}`, payload);
      return response.data;
    } catch {
      const current = getLocalSubAdmins();
      const updatedList = current.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            powers: payload.powers,
            status: payload.status || sub.status,
          };
        }
        return sub;
      });
      saveLocalSubAdmins(updatedList);
      const updated = updatedList.find((s) => s.id === id);
      if (!updated) throw new Error('Sub-admin not found');
      return updated;
    }
  },

  /**
   * DELETE /api/admin/sub-admins/:id
   */
  deleteSubAdmin: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/admin/sub-admins/${id}`);
      const current = getLocalSubAdmins();
      saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
      return response.data;
    } catch {
      const current = getLocalSubAdmins();
      saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
      return { message: 'Sub-admin account revoked successfully' };
    }
  },
};
