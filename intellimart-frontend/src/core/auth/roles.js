/**
 * Role helpers: normalisasi nama role dan tujuan dashboard per role.
 */
export const ROLES = Object.freeze({
  OWNER: 'owner',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  CUSTOMER: 'customer',
});

const ROLE_ALIASES = Object.freeze({
  kasir: ROLES.CASHIER,
  kustomer: ROLES.CUSTOMER,
  pelanggan: ROLES.CUSTOMER,
});

const ROLE_BY_ID = Object.freeze({
  1: ROLES.OWNER,
  2: ROLES.MANAGER,
  3: ROLES.CASHIER,
  4: ROLES.CUSTOMER,
});

export const ROLE_HOME = Object.freeze({
  [ROLES.OWNER]: '/dashboard',
  [ROLES.MANAGER]: '/manager/dashboard',
  [ROLES.CASHIER]: '/cashier/dashboard',
  [ROLES.CUSTOMER]: '/customer/dashboard',
});

export function getUserRole(user) {
  const raw = (user?.role || user?.role_name || '').toString().trim().toLowerCase();
  const normalized = ROLE_ALIASES[raw] || raw;
  if (ROLE_HOME[normalized]) {
    return normalized;
  }
  return ROLE_BY_ID[Number(user?.role_id)] || '';
}

export function getHomeByRole(user) {
  return ROLE_HOME[getUserRole(user)] || '/login';
}
