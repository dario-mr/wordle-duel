import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  let listener: (() => void) | undefined;
  return {
    getAccessToken: vi.fn(),
    subscribeAccessToken: vi.fn((next: () => void) => {
      listener = next;
      return () => {
        listener = undefined;
      };
    }),
    emit: () => {
      listener?.();
    },
  };
});

vi.mock('../../src/auth/tokenManager.ts', () => ({
  getAccessToken: mocks.getAccessToken,
  subscribeAccessToken: mocks.subscribeAccessToken,
}));

describe('useIsAuthenticated', () => {
  beforeEach(() => {
    mocks.getAccessToken.mockReset();
    mocks.subscribeAccessToken.mockClear();
  });

  it('reflects the initial auth state from the current token', async () => {
    const { useIsAuthenticated } = await import('../../src/hooks/useIsAuthenticated');
    mocks.getAccessToken.mockReturnValue('token-1');

    const { result } = renderHook(() => useIsAuthenticated());

    expect(result.current).toBe(true);
  });

  it('updates when the token subscription fires', async () => {
    const { useIsAuthenticated } = await import('../../src/hooks/useIsAuthenticated');
    mocks.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useIsAuthenticated());
    expect(result.current).toBe(false);

    mocks.getAccessToken.mockReturnValue('token-1');
    act(() => {
      mocks.emit();
    });

    expect(result.current).toBe(true);
  });
});
