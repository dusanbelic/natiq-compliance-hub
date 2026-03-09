import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database';

export interface Permissions {
  role: UserRole;
  canManageTeam: boolean;
  canEditCompany: boolean;
  canEditEmployees: boolean;
  canViewReports: boolean;
  canViewSettings: boolean;
  canInviteMembers: boolean;
  canDeleteEmployees: boolean;
  canManageBilling: boolean;
  isAdmin: boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  hr_director: 4,
  cfo: 3,
  hr_manager: 2,
  viewer: 1,
};

export function usePermissions(): Permissions {
  const { profile } = useAuth();
  const role: UserRole = profile?.role ?? 'viewer';
  const level = ROLE_HIERARCHY[role] ?? 1;

  return {
    role,
    isAdmin: role === 'admin',
    canManageTeam: level >= 4, // admin, hr_director
    canEditCompany: level >= 4, // admin, hr_director
    canInviteMembers: level >= 4, // admin, hr_director
    canManageBilling: level >= 4, // admin, hr_director
    canEditEmployees: level >= 2, // admin, hr_director, cfo, hr_manager
    canDeleteEmployees: level >= 3, // admin, hr_director, cfo
    canViewReports: level >= 1, // everyone
    canViewSettings: level >= 2, // everyone except viewer for edit, viewer can see profile
  };
}
