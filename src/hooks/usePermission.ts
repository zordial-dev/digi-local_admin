import { useAuth } from './useAuth';
import type { PowerSection } from '../types/rbac.types';

export const usePermission = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const userPowers: PowerSection[] = (user as any)?.powers || (isSuperAdmin ? [
    'SOCIETIES',
    'VENDORS',
    'SUBSCRIPTIONS',
    'SUPPORT',
    'SETTINGS',
    'SUB_ADMINS',
  ] : []);

  const hasPower = (section?: PowerSection): boolean => {
    if (!section) return true;
    if (isSuperAdmin) return true;
    return userPowers.includes(section);
  };

  return {
    isSuperAdmin,
    userPowers,
    hasPower,
  };
};
