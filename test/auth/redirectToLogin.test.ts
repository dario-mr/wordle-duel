import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../../src/state/storageKeys';
import { redirectToLogin } from '../../src/auth/redirectToLogin';

function makeLocationStub(assign: ReturnType<typeof vi.fn>) {
  return {
    assign,
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    href: window.location.href,
  };
}

describe('redirectToLogin', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubEnv('BASE_URL', '/');
  });

  it('stores the current path and redirects to login with returnTo', () => {
    window.history.pushState({}, '', '/rooms/abc?foo=bar#baz');
    const assign = vi.fn();
    vi.stubGlobal('location', makeLocationStub(assign));

    redirectToLogin();

    expect(sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBe('/rooms/abc?foo=bar#baz');
    expect(assign).toHaveBeenCalledWith(
      'http://localhost/login?returnTo=%2Frooms%2Fabc%3Ffoo%3Dbar%23baz',
    );
  });

  it('does nothing when already on the login route', () => {
    window.history.pushState({}, '', '/login');
    const assign = vi.fn();
    vi.stubGlobal('location', makeLocationStub(assign));

    redirectToLogin();

    expect(sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });

  it('strips the basename before storing and redirecting', () => {
    vi.stubEnv('BASE_URL', '/wordle-duel/');
    window.history.pushState({}, '', '/wordle-duel/rooms/abc?foo=bar');
    const assign = vi.fn();
    vi.stubGlobal('location', makeLocationStub(assign));

    redirectToLogin();

    expect(sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBe('/rooms/abc?foo=bar');
    expect(assign).toHaveBeenCalledWith(
      'http://localhost/wordle-duel/login?returnTo=%2Frooms%2Fabc%3Ffoo%3Dbar',
    );
  });
});
