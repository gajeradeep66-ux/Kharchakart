const VALID_ROLES = ['user', 'employee', 'manager', 'finance', 'owner'];

const ROLE_ALIASES = {
  admin: 'owner',
  owner: 'owner',
  employee: 'employee',
  user: 'user',
  manager: 'manager',
  finance: 'finance',
};

const ROLE_DEFAULTS = {
  user: {
    permissions: ['submit_expenses', 'view_own_expenses'],
    approvalLimit: 0,
  },
  employee: {
    permissions: ['submit_expenses', 'view_own_expenses'],
    approvalLimit: 0,
  },
  manager: {
    permissions: ['view_team_expenses', 'approve_expenses'],
    approvalLimit: 25000,
  },
  finance: {
    permissions: ['view_all_expenses', 'audit_expenses'],
    approvalLimit: 50000,
  },
  owner: {
    permissions: ['view_all_expenses', 'manage_users', 'approve_expenses'],
    approvalLimit: 100000,
  },
};

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return 'user';
  const cleaned = role.trim().toLowerCase();
  return ROLE_ALIASES[cleaned] || cleaned;
};

const isEmployeeRole = (role) => ['user', 'employee'].includes(normalizeRole(role));
const isOwnerRole = (role) => normalizeRole(role) === 'owner';
const isApproverRole = (role) => ['manager', 'finance', 'owner'].includes(normalizeRole(role));

module.exports = {
  VALID_ROLES,
  ROLE_ALIASES,
  ROLE_DEFAULTS,
  normalizeRole,
  isEmployeeRole,
  isOwnerRole,
  isApproverRole,
};
