/**
 * Role-based permissions system for Weblyx Admin
 */

export type UserRole = 'owner' | 'admin' | 'specialist';

// Define all available permissions/features
export type Permission =
  | 'dashboard'
  | 'leads'
  | 'projects'
  | 'portfolio'
  | 'media'
  | 'content'
  | 'stats'
  | 'blog'
  | 'reviews'
  | 'promo_codes'
  | 'payments'
  | 'invoices'
  | 'web_analyzer'
  | 'lead_generation'
  | 'eroweb'
  | 'settings'
  | 'users';

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Owner - maximum access to everything including user management
  owner: [
    'dashboard',
    'leads',
    'projects',
    'portfolio',
    'media',
    'content',
    'stats',
    'blog',
    'reviews',
    'promo_codes',
    'payments',
    'invoices',
    'web_analyzer',
    'lead_generation',
    'eroweb',
    'settings',
    'users',
  ],

  // Admin - full administrative access
  admin: [
    'dashboard',
    'leads',
    'projects',
    'portfolio',
    'media',
    'content',
    'stats',
    'blog',
    'reviews',
    'promo_codes',
    'payments',
    'invoices',
    'web_analyzer',
    'lead_generation',
    'eroweb',
    'settings',
    'users',
  ],

  // Specialist - limited access to sales/operations features
  specialist: [
    'dashboard',
    'leads',
    'projects',
    'blog',
    'web_analyzer',
    'eroweb',
    'settings',
  ],
};

// Role display names for each locale
export const ROLE_NAMES: Record<UserRole, { cs: string; en: string; ru: string }> = {
  owner: {
    cs: 'Vlastník',
    en: 'Owner',
    ru: 'Владелец',
  },
  admin: {
    cs: 'Administrátor',
    en: 'Administrator',
    ru: 'Администратор',
  },
  specialist: {
    cs: 'Specialista',
    en: 'Specialist',
    ru: 'Специалист',
  },
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, { cs: string; en: string; ru: string }> = {
  owner: {
    cs: 'Maximální práva - vlastník firmy',
    en: 'Maximum access - business owner',
    ru: 'Максимальные права - владелец',
  },
  admin: {
    cs: 'Plný přístup k administraci',
    en: 'Full administrative access',
    ru: 'Полный административный доступ',
  },
  specialist: {
    cs: 'Přístup k poptávkám, projektům, blogu a analýzám',
    en: 'Access to leads, projects, blog and analysis tools',
    ru: 'Доступ к заявкам, проектам, блогу и аналитике',
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole | undefined): boolean {
  return hasPermission(role, 'users');
}

/**
 * Check if user can delete other users (only owner)
 */
export function canDeleteUsers(role: UserRole | undefined): boolean {
  return role === 'owner';
}

/**
 * Check if user is owner
 */
export function isOwner(role: UserRole | undefined): boolean {
  return role === 'owner';
}

/**
 * Check if user is admin level or higher
 */
export function isAdminOrHigher(role: UserRole | undefined): boolean {
  return role === 'owner' || role === 'admin';
}
