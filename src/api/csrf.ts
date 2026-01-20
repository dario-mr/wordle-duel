import { getCookieValue } from '../utils/cookies';

export const CSRF_HEADER_NAME = 'X-WD-XSRF-TOKEN';
const CSRF_COOKIE_NAME = 'WD-XSRF-TOKEN';

export function getXsrfTokenFromCookie(): string | undefined {
  return getCookieValue(CSRF_COOKIE_NAME);
}
