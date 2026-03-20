import { beforeEach, describe, expect, it, vi } from 'vitest';

function mockStoredTheme(value: string | null, shouldThrow = false) {
  const getItem = vi.fn((key: string) => {
    if (shouldThrow) {
      throw new Error('storage failed');
    }
    return key === 'wd.theme' ? value : null;
  });
  const setItem = vi.fn((key: string, nextValue: string) => {
    if (shouldThrow) {
      throw new Error('storage failed');
    }
    return [key, nextValue];
  });
  vi.stubGlobal('localStorage', { getItem, setItem });
  return { getItem, setItem };
}

function mockMatchMedia(matches: boolean) {
  const matchMedia = vi.fn(() => ({ matches }));
  vi.stubGlobal('matchMedia', matchMedia);
  return matchMedia;
}

async function loadThemeStore() {
  vi.resetModules();
  return await import('../../src/state/themeStore');
}

describe('themeStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the persisted theme when available', async () => {
    mockStoredTheme('light');
    mockMatchMedia(true);

    const { useThemeStore } = await loadThemeStore();

    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('falls back to matchMedia when storage is empty or invalid', async () => {
    mockStoredTheme('invalid');
    mockMatchMedia(true);

    let mod = await loadThemeStore();
    expect(mod.useThemeStore.getState().theme).toBe('dark');

    mockStoredTheme(null);
    mockMatchMedia(false);
    mod = await loadThemeStore();
    expect(mod.useThemeStore.getState().theme).toBe('light');
  });

  it('persists and updates theme via setTheme and toggleTheme', async () => {
    const storage = mockStoredTheme('light');
    mockMatchMedia(false);
    const { useThemeStore } = await loadThemeStore();

    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(storage.setItem).toHaveBeenCalledWith('wd.theme', 'dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(storage.setItem).toHaveBeenLastCalledWith('wd.theme', 'light');
  });

  it('swallows storage failures and falls back to preferred theme', async () => {
    mockStoredTheme(null, true);
    mockMatchMedia(false);

    const { useThemeStore } = await loadThemeStore();

    expect(useThemeStore.getState().theme).toBe('light');
    expect(() => {
      useThemeStore.getState().setTheme('dark');
    }).not.toThrow();
  });
});
