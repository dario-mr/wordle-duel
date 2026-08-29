import type { Mock } from 'vitest';

interface AuthModuleMocks {
  getCurrentUser: Mock;
}

export function resetAuthModuleMocks(mocks: AuthModuleMocks, user: unknown = null) {
  mocks.getCurrentUser.mockReset();
  mocks.getCurrentUser.mockReturnValue(user);
}
