export const VALID_ROLES = ['user', 'employee', 'manager', 'finance', 'owner'];

export const ROLE_ALIASES = {
  admin: 'owner',
  owner: 'owner',
  employee: 'employee',
  user: 'user',
  manager: 'manager',
  finance: 'finance',
};

export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return 'user';
  const cleaned = role.trim().toLowerCase();
  return ROLE_ALIASES[cleaned] || cleaned;
};

export const isEmployeeRole = (role) => ['user', 'employee'].includes(normalizeRole(role));
export const isOwnerRole = (role) => normalizeRole(role) === 'owner';
export const canAccessApprovals = (role) => ['manager', 'finance', 'owner'].includes(normalizeRole(role));
