import { afterEach, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';

  for (const entry of document.cookie.split(';')) {
    const [rawName] = entry.trim().split('=');
    if (rawName) {
      document.cookie = `${rawName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }

  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
