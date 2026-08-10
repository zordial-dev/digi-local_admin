import { axiosInstance } from './axiosInstance';
import type {
  PersonProfile,
  CreatePersonRequest,
  PeopleFilterOptions,
  PeopleAnalyticsSummary,
} from '../../types/people.types';

const INITIAL_PEOPLE_MOCK: PersonProfile[] = [
  {
    id: 'usr-1',
    name: 'Aarav Gupta',
    email: 'aarav.retail@gmail.com',
    phone: '+91 98123 45678',
    personType: 'user',
    status: 'active',
    societyName: 'Anupam Society',
    flatNumber: 'A-108',
    flagsCount: 0,
    totalOrdersCount: 42,
    totalComplaintsCount: 1,
    createdAt: '2025-11-10T08:30:00Z',
    lastActiveAt: '2026-08-07T10:15:00Z',
  },
  {
    id: 'usr-2',
    name: 'Commander V.K. Nair',
    email: 'vknair.resident@gmail.com',
    phone: '+91 97766 55443',
    personType: 'user',
    status: 'warned',
    societyName: 'Greenwood Heights Society',
    flatNumber: 'C-502',
    flagsCount: 2,
    totalOrdersCount: 19,
    totalComplaintsCount: 4,
    createdAt: '2025-12-01T14:20:00Z',
    lastActiveAt: '2026-08-06T18:00:00Z',
  },
  {
    id: 'v-102',
    name: 'Priya Verma',
    email: 'priya.organic@gmail.com',
    phone: '+91 98111 22334',
    personType: 'user_vendor',
    status: 'active',
    societyName: 'Anupam Society',
    flatNumber: 'B-304',
    storeName: 'Priya Organic Mart',
    category: 'Organic Fruits & Snacks',
    flagsCount: 1,
    rating: 4.6,
    totalOrdersCount: 88,
    totalComplaintsCount: 3,
    createdAt: '2025-09-20T09:15:00Z',
    lastActiveAt: '2026-08-07T12:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Meera Deshmukh',
    email: 'meera.res@gmail.com',
    phone: '+91 98999 11223',
    personType: 'user',
    status: 'active',
    societyName: 'Sunrise Apartments',
    flatNumber: 'D-201',
    flagsCount: 0,
    totalOrdersCount: 31,
    totalComplaintsCount: 0,
    createdAt: '2025-08-14T10:00:00Z',
    lastActiveAt: '2026-08-07T11:20:00Z',
  },
  {
    id: 'usr-4',
    name: 'Rohan Mehta',
    email: 'rohan.m@gmail.com',
    phone: '+91 97888 33445',
    personType: 'user_vendor',
    status: 'warned',
    societyName: 'Prestige Heights',
    flatNumber: 'E-503',
    storeName: 'Rohan Electronics & Supplies',
    category: 'Home Electronics',
    flagsCount: 2,
    rating: 3.8,
    totalOrdersCount: 24,
    totalComplaintsCount: 2,
    createdAt: '2025-10-05T16:45:00Z',
    lastActiveAt: '2026-08-06T15:10:00Z',
  },
];

export const peopleApi = {
  getPeople: async (filters?: PeopleFilterOptions): Promise<PersonProfile[]> => {
    try {
      const response = await axiosInstance.get('/people', { params: filters });
      if (response.data && Array.isArray(response.data)) {
        // Strictly filter to user and user_vendor (dual role) only
        return response.data.filter(
          (p) => p.personType === 'user' || p.personType === 'user_vendor'
        );
      }
    } catch {
      // Graceful fallback
    }

    // Strictly filter mock to user and user_vendor
    let list = INITIAL_PEOPLE_MOCK.filter(
      (p) => p.personType === 'user' || p.personType === 'user_vendor'
    );

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.storeName && p.storeName.toLowerCase().includes(q)) ||
          p.societyName.toLowerCase().includes(q)
      );
    }

    if (filters?.personType && filters.personType !== 'all') {
      list = list.filter((p) => p.personType === filters.personType);
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters?.societyName && filters.societyName !== 'all') {
      list = list.filter((p) => p.societyName.toLowerCase().includes(filters.societyName!.toLowerCase()));
    }

    if (filters?.minFlags !== undefined && filters.minFlags > 0) {
      list = list.filter((p) => p.flagsCount >= filters.minFlags!);
    }

    return list;
  },

  getPersonById: async (id: string): Promise<PersonProfile> => {
    try {
      const response = await axiosInstance.get(`/people/${id}`);
      if (response.data) return response.data;
    } catch {
      // Graceful fallback
    }

    const found = INITIAL_PEOPLE_MOCK.find((p) => p.id === id);
    if (found) return found;

    return {
      id,
      name: 'User Profile',
      email: 'user@example.com',
      phone: '+91 98000 00000',
      personType: 'user',
      status: 'active',
      societyName: 'Anupam Society',
      flagsCount: 0,
      totalOrdersCount: 0,
      totalComplaintsCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  },

  createPerson: async (data: CreatePersonRequest): Promise<PersonProfile> => {
    try {
      const response = await axiosInstance.post('/people', data);
      if (response.data) return response.data;
    } catch {
      // Graceful fallback
    }

    const newPerson: PersonProfile = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      personType: data.personType === 'user_vendor' ? 'user_vendor' : 'user',
      status: 'active',
      societyName: data.societyName || 'Anupam Society',
      flatNumber: data.flatNumber,
      storeName: data.storeName,
      category: data.category,
      flagsCount: 0,
      totalOrdersCount: 0,
      totalComplaintsCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    INITIAL_PEOPLE_MOCK.unshift(newPerson);
    return newPerson;
  },

  updatePersonStatus: async (
    id: string,
    status: PersonProfile['status']
  ): Promise<PersonProfile> => {
    try {
      const response = await axiosInstance.put(`/people/${id}/status`, { status });
      if (response.data) return response.data;
    } catch {
      // Graceful fallback
    }

    const index = INITIAL_PEOPLE_MOCK.findIndex((p) => p.id === id);
    if (index !== -1) {
      INITIAL_PEOPLE_MOCK[index].status = status;
      return INITIAL_PEOPLE_MOCK[index];
    }

    throw new Error('User not found');
  },

  flagPerson: async (id: string): Promise<{ person: PersonProfile; wasBanned: boolean }> => {
    try {
      const response = await axiosInstance.post(`/people/${id}/flag`);
      if (response.data) return response.data;
    } catch {
      // Graceful fallback
    }

    const person = INITIAL_PEOPLE_MOCK.find((p) => p.id === id);
    if (person) {
      person.flagsCount += 1;
      let wasBanned = false;
      if (person.flagsCount >= 3) {
        person.status = 'banned';
        wasBanned = true;
      } else {
        person.status = 'warned';
      }
      return { person, wasBanned };
    }

    throw new Error('User not found');
  },

  getPeopleAnalytics: async (): Promise<PeopleAnalyticsSummary> => {
    try {
      const response = await axiosInstance.get('/people/analytics');
      if (response.data) return response.data;
    } catch {
      // Fallback calculation
    }

    const userList = INITIAL_PEOPLE_MOCK.filter(
      (p) => p.personType === 'user' || p.personType === 'user_vendor'
    );
    const total = userList.length;
    const users = userList.filter((p) => p.personType === 'user').length;
    const dualRole = userList.filter((p) => p.personType === 'user_vendor').length;
    const warned = userList.filter((p) => p.status === 'warned').length;
    const banned = userList.filter((p) => p.status === 'banned' || p.status === 'blocked').length;

    return {
      totalPeopleCount: total,
      usersCount: users,
      vendorsCount: dualRole, // Dual Role count
      subAdminsCount: 0,
      warnedCount: warned,
      bannedCount: banned,
      activeRate: Math.round(((total - banned) / total) * 100),
    };
  },
};
