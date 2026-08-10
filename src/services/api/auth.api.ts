import { axiosInstance } from './axiosInstance';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  VendorLoginRequest,
  VendorLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
} from '../../types/auth.types';

export const authApi = {
  /**
   * POST /api/admin/login
   * Public Admin Secret Login
   */
  loginAdmin: async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await axiosInstance.post<AdminLoginResponse>('/admin/login', payload);
    return response.data;
  },

  /**
   * POST /api/vendors/login
   * Public Vendor Email & Password Login
   */
  loginVendor: async (payload: VendorLoginRequest): Promise<VendorLoginResponse> => {
    const response = await axiosInstance.post<VendorLoginResponse>('/vendors/login', payload);
    return response.data;
  },

  /**
   * POST /api/vendors/refresh
   * Public Refresh Token Endpoint
   */
  refreshToken: async (payload: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/vendors/refresh', payload);
    return response.data;
  },

  /**
   * POST /api/vendors/logout
   * Protected Logout / Token Revocation Endpoint
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await axiosInstance.post<LogoutResponse>('/vendors/logout');
    return response.data;
  },
};
