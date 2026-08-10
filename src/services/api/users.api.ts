import { axiosInstance } from './axiosInstance';
import type { UserProfile } from '../../types/user.types';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Commander V.K. Nair',
    email: 'vknair.resident@gmail.com',
    phone: '+91 98765 43210',
    societyName: 'Anupam Society',
    flatNumber: 'B-402',
    flagsCount: 1,
    status: 'active',
    totalOrders: 28,
    totalSpend: 14500,
    totalComplaintsRaised: 3,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Aarav Gupta',
    email: 'aarav.retail@gmail.com',
    phone: '+91 98123 45678',
    societyName: 'Anupam Society',
    flatNumber: 'A-108',
    flagsCount: 0,
    status: 'active',
    totalOrders: 42,
    totalSpend: 28900,
    totalComplaintsRaised: 1,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Rajesh Sharma',
    email: 'rajesh.freshbites@gmail.com',
    phone: '+91 97111 22334',
    societyName: 'Prestige Heights',
    flatNumber: 'C-701',
    flagsCount: 2,
    status: 'warned',
    totalOrders: 15,
    totalSpend: 8400,
    totalComplaintsRaised: 5,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Priya Verma',
    email: 'priya.verma@gmail.com',
    phone: '+91 98765 11223',
    societyName: 'Greenwood Heights',
    flatNumber: 'D-302',
    flagsCount: 0,
    status: 'active',
    totalOrders: 65,
    totalSpend: 42300,
    totalComplaintsRaised: 0,
    createdAt: new Date(Date.now() - 86400000 * 150).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'usr-5',
    name: 'Vikram Mehta',
    email: 'vikram.m@gmail.com',
    phone: '+91 99887 76655',
    societyName: 'Sunrise Apartments',
    flatNumber: 'E-101',
    flagsCount: 3,
    status: 'banned',
    totalOrders: 8,
    totalSpend: 3200,
    totalComplaintsRaised: 6,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    lastActive: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const STORAGE_KEY = 'digilocal_users_store';

const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored users:', e);
  }
  return INITIAL_USERS;
};

const saveStoredUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving stored users:', e);
  }
};

export const usersApi = {
  getUsers: async (): Promise<UserProfile[]> => {
    try {
      const response = await axiosInstance.get('/users');
      if (Array.isArray(response.data) && response.data.length > 0) {
        saveStoredUsers(response.data);
        return response.data;
      }
    } catch {}
    return getStoredUsers();
  },

  getUserByNameOrEmail: async (identifier: string): Promise<UserProfile> => {
    try {
      const response = await axiosInstance.get(`/users/${encodeURIComponent(identifier)}`);
      if (response.data) {
        return response.data;
      }
    } catch {}

    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        u.name.toLowerCase().includes(identifier.toLowerCase()) ||
        u.email.toLowerCase() === identifier.toLowerCase()
    );

    if (found) return found;

    // Fallback created dynamically if user doesn't exist yet
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      email: identifier.includes('@') ? identifier : `${identifier.toLowerCase().replace(/\s+/g, '')}@digilocal.com`,
      phone: '+91 98765 43210',
      societyName: 'Anupam Society',
      flatNumber: 'A-201',
      flagsCount: 0,
      status: 'active',
      totalOrders: 12,
      totalSpend: 5400,
      totalComplaintsRaised: 1,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    saveStoredUsers([...users, newProfile]);
    return newProfile;
  },

  flagUser: async (userId: string): Promise<{ user: UserProfile; wasBanned: boolean }> => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/flag`);
      if (response.data) {
        return response.data;
      }
    } catch {}

    const users = getStoredUsers();
    let wasBanned = false;

    const updated = users.map((u) => {
      if (u.id === userId) {
        const newFlags = Math.min(u.flagsCount + 1, 3);
        const isBanned = newFlags >= 3;
        wasBanned = isBanned;
        return {
          ...u,
          flagsCount: newFlags,
          status: isBanned ? ('banned' as const) : newFlags > 1 ? ('warned' as const) : u.status,
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    const user = updated.find((u) => u.id === userId)!;
    return { user, wasBanned };
  },

  resetUserFlags: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/reset-flags`);
      if (response.data) {
        return response.data;
      }
    } catch {}

    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          flagsCount: 0,
          status: 'active' as const,
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    return updated.find((u) => u.id === userId)!;
  },
};
