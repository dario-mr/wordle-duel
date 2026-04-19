import { jwtDecode } from 'jwt-decode';

export type UserRole = 'USER' | 'ADMIN';

export interface JwtUser {
  id: string;
  email: string;
  roles: UserRole[];
}

interface AccessTokenClaims {
  sub: string;
  email?: string;
  roles?: string[];
  exp?: number;
}

export function getUserFromAccessToken(token: string): JwtUser | null {
  try {
    const claims = jwtDecode<AccessTokenClaims>(token);

    if (!claims.sub) {
      return null;
    }

    return {
      id: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : '',
      roles: Array.isArray(claims.roles) ? (claims.roles as UserRole[]) : [],
    };
  } catch {
    return null;
  }
}
