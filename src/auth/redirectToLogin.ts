import { STORAGE_KEYS } from '../state/storageKeys';

export function redirectToLogin(): void {
  const currentPathname = stripBasename(window.location.pathname);
  if (currentPathname === '/login') {
    return;
  }

  const returnTo =
    currentPathname + window.location.search + (window.location.hash ? window.location.hash : '');

  sessionStorage.setItem(STORAGE_KEYS.authReturnTo, returnTo);

  const baseUrl = import.meta.env.BASE_URL;
  const loginPath = baseUrl.endsWith('/') ? `${baseUrl}login` : `${baseUrl}/login`;
  const loginUrl = new URL(loginPath, window.location.origin);
  loginUrl.searchParams.set('returnTo', returnTo);

  window.location.assign(loginUrl.toString());
}

function getBasename(): string {
  return import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
}

function stripBasename(pathname: string): string {
  const base = getBasename();
  if (!base) {
    return pathname;
  }
  return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}
