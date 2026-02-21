export const USERS_FILTER_FIELDS = ['fullName', 'email'] as const;

export type UsersFilterField = (typeof USERS_FILTER_FIELDS)[number];
export type UsersFilters = Record<UsersFilterField, string>;

export const EMPTY_USERS_FILTERS: UsersFilters = Object.fromEntries(
  USERS_FILTER_FIELDS.map((field) => [field, '']),
) as UsersFilters;

export function trimUsersFilters(filters: UsersFilters): UsersFilters {
  const trimmed = { ...filters };
  for (const field of USERS_FILTER_FIELDS) {
    trimmed[field] = filters[field].trim();
  }
  return trimmed;
}

export function getActiveUsersFilters(filters: UsersFilters): Partial<UsersFilters> {
  const active: Partial<UsersFilters> = {};
  for (const field of USERS_FILTER_FIELDS) {
    if (filters[field]) {
      active[field] = filters[field];
    }
  }
  return active;
}
