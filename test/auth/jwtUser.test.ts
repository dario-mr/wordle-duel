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
      sub: 'alice@example.com',
      uid: 'user-1',
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
      sub: 'alice@example.com',
      uid: 'user-1',
    });

    expect(getUserFromAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'alice@example.com',
      roles: [],
    });
  });

  it('returns null when required claims are missing', () => {
    expect(getUserFromAccessToken(makeJwt({ uid: 'user-1' }))).toBeNull();
    expect(getUserFromAccessToken(makeJwt({ sub: 'alice@example.com' }))).toBeNull();
    expect(getUserFromAccessToken(makeJwt({ sub: 'alice@example.com', uid: '   ' }))).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(getUserFromAccessToken('not-a-jwt')).toBeNull();
  });
});
