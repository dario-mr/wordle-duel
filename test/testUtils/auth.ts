import type { Mock } from 'vitest';

interface AuthModuleMocks {
  getCurrentUser: Mock;
  subscribeCurrentUser: Mock;
}

export function resetAuthModuleMocks(
  mocks: AuthModuleMocks,
  user: unknown = null,
  unsubscribe: () => void = () => undefined,
) {
  mocks.getCurrentUser.mockReset();
  mocks.getCurrentUser.mockReturnValue(user);
  mocks.subscribeCurrentUser.mockReset();
  mocks.subscribeCurrentUser.mockReturnValue(unsubscribe);
}
