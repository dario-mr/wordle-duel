import { describe, expect, it } from 'vitest';
import { sanitizeReturnTo } from '../../src/utils/sanitizeReturnTo';

describe('sanitizeReturnTo', () => {
  it('accepts safe internal paths', () => {
    expect(sanitizeReturnTo('/rooms/abc?foo=bar#baz')).toBe('/rooms/abc?foo=bar#baz');
  });

  it('rejects empty and non-rooted values', () => {
    expect(sanitizeReturnTo(null)).toBeNull();
    expect(sanitizeReturnTo('rooms/abc')).toBeNull();
  });

  it('rejects protocol-relative and absolute URLs', () => {
    expect(sanitizeReturnTo('//evil.test')).toBeNull();
    expect(sanitizeReturnTo('/https://evil.test')).toBeNull();
    expect(sanitizeReturnTo('https://evil.test')).toBeNull();
  });

  it('rejects backslash-based paths', () => {
    expect(sanitizeReturnTo('/rooms\\abc')).toBeNull();
  });
});
