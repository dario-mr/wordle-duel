import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  normalizeUiLocale: vi.fn((value: string | null | undefined) => (value === 'it' ? 'it' : 'en')),
  getPreferredUiLocale: vi.fn(() => 'en'),
}));

vi.mock('../../src/i18n', () => ({
  normalizeUiLocale: mocks.normalizeUiLocale,
  getPreferredUiLocale: mocks.getPreferredUiLocale,
}));

function mockLocaleStorage(value: string | null, shouldThrow = false) {
  const getItem = vi.fn((key: string) => {
    if (shouldThrow) {
      throw new Error('storage failed');
    }
    return key === 'wd.locale' ? value : null;
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

async function loadLocaleStore() {
  vi.resetModules();
  return await import('../../src/state/localeStore');
}

describe('localeStore', () => {
  beforeEach(() => {
    mocks.normalizeUiLocale.mockClear();
    mocks.getPreferredUiLocale.mockClear();
    mocks.getPreferredUiLocale.mockReturnValue('en');
    vi.unstubAllGlobals();
  });

  it('reads and normalizes the stored locale', async () => {
    mockLocaleStorage('it');

    const { useLocaleStore } = await loadLocaleStore();

    expect(mocks.normalizeUiLocale).toHaveBeenCalledWith('it');
    expect(useLocaleStore.getState().locale).toBe('it');
  });

  it('falls back to the preferred locale when storage is empty', async () => {
    mockLocaleStorage(null);

    const { useLocaleStore } = await loadLocaleStore();

    expect(mocks.getPreferredUiLocale).toHaveBeenCalled();
    expect(useLocaleStore.getState().locale).toBe('en');
  });

  it('persists and updates locale via setLocale', async () => {
    const storage = mockLocaleStorage('en');
    const { useLocaleStore } = await loadLocaleStore();

    useLocaleStore.getState().setLocale('it');

    expect(useLocaleStore.getState().locale).toBe('it');
    expect(storage.setItem).toHaveBeenCalledWith('wd.locale', 'it');
  });

  it('swallows storage failures', async () => {
    mockLocaleStorage(null, true);
    const { useLocaleStore } = await loadLocaleStore();

    expect(useLocaleStore.getState().locale).toBe('en');
    expect(() => {
      useLocaleStore.getState().setLocale('it');
    }).not.toThrow();
  });
});
