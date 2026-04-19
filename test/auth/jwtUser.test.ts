import { describe, expect, it } from 'vitest';
import { getUserFromAccessToken } from '../../src/auth/jwtUser';

function makeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  return `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.`;
}

function encodeBase64Url(value: Record<string, unknown>): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

describe('getUserFromAccessToken', () => {
  it('parses a valid token into a JwtUser', () => {
    const token = makeJwt({
      sub: 'user-1',
      email: 'alice@example.com',
      roles: ['USER', 'ADMIN'],
    });

    expect(getUserFromAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'alice@example.com',
      roles: ['USER', 'ADMIN'],
    });
  });

  it('returns an empty role list when roles are missing', () => {
    const token = makeJwt({
      sub: 'user-1',
      email: 'alice@example.com',
    });

    expect(getUserFromAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'alice@example.com',
      roles: [],
    });
  });

  it('returns null when required claims are missing', () => {
    expect(getUserFromAccessToken(makeJwt({ email: 'alice@example.com' }))).toBeNull();
  });

  it('returns an empty email when the email claim is missing', () => {
    expect(getUserFromAccessToken(makeJwt({ sub: 'user-1', roles: ['USER'] }))).toEqual({
      id: 'user-1',
      email: '',
      roles: ['USER'],
    });
  });

  it('returns null for malformed tokens', () => {
    expect(getUserFromAccessToken('not-a-jwt')).toBeNull();
  });
});
