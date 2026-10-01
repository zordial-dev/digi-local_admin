export interface PlatformConfig {
  platform_logo: string;
  platform_name: string;
  annual_subscription_price?: number;
}

export interface ConfigResponse {
  message?: string;
  platform_logo: string;
  platform_name: string;
  annual_subscription_price?: number;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
