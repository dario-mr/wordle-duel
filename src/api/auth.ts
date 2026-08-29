import { apiFetch } from './apiFetch';
import { backendUrl } from './url';

export function beginGoogleLogin(): void {
  window.location.assign(backendUrl('/oauth2/authorization/google'));
}

export async function logout(): Promise<void> {
  const res = await apiFetch(backendUrl('/auth/logout'), { method: 'POST' });

  if (res.ok || res.status === 401 || res.status === 403) {
    return;
  }

  throw new Error(`Logout failed with status ${String(res.status)}`);
}
