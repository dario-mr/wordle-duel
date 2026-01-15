import { jwtDecode } from 'jwt-decode';

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface AccessTokenClaims {
  sub: string;
  name?: string;
  uid?: string;
  roles?: string[];
  exp?: number;
}

export function getUserFromAccessToken(token: string): JwtUser | null {
  try {
    const claims = jwtDecode<AccessTokenClaims>(token);

    if (!claims.sub) {
      return null;
    }

    if (typeof claims.uid !== 'string' || claims.uid.trim().length === 0) {
      return null;
    }

    return {
      id: claims.uid,
      email: claims.sub,
      name: claims.name ?? claims.sub,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    };
  } catch {
    return null;
  }
}
