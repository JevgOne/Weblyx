import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isInternalRequest, internalRequestHeaders } from '@/lib/auth/internal-request';

const ORIGINAL = process.env.INTERNAL_API_SECRET;

function req(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/leads/x/generate-design', { method: 'POST', headers });
}

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.INTERNAL_API_SECRET;
  else process.env.INTERNAL_API_SECRET = ORIGINAL;
});

describe('isInternalRequest — secret configured', () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = 'super-secret-value-123';
  });

  it('accepts the exact secret', () => {
    expect(isInternalRequest(req({ 'x-internal-secret': 'super-secret-value-123' }))).toBe(true);
  });

  it('is case sensitive on the header value', () => {
    expect(isInternalRequest(req({ 'x-internal-secret': 'SUPER-SECRET-VALUE-123' }))).toBe(false);
  });

  it('rejects a wrong secret of the same length (timing-safe path)', () => {
    expect(isInternalRequest(req({ 'x-internal-secret': 'super-secret-value-124' }))).toBe(false);
  });

  it('rejects a prefix / a longer value without throwing on length mismatch', () => {
    expect(isInternalRequest(req({ 'x-internal-secret': 'super' }))).toBe(false);
    expect(isInternalRequest(req({ 'x-internal-secret': 'super-secret-value-123456' }))).toBe(false);
  });

  it('rejects a missing header', () => {
    expect(isInternalRequest(req())).toBe(false);
  });

  it('rejects an empty header', () => {
    expect(isInternalRequest(req({ 'x-internal-secret': '' }))).toBe(false);
  });

  it('reads the header case-insensitively (HTTP header names)', () => {
    expect(isInternalRequest(req({ 'X-Internal-Secret': 'super-secret-value-123' }))).toBe(true);
  });
});

describe('isInternalRequest — secret NOT configured', () => {
  it('rejects everything, including an empty provided secret (fail closed)', () => {
    delete process.env.INTERNAL_API_SECRET;
    expect(isInternalRequest(req())).toBe(false);
    expect(isInternalRequest(req({ 'x-internal-secret': '' }))).toBe(false);
    expect(isInternalRequest(req({ 'x-internal-secret': 'anything' }))).toBe(false);
  });

  it('rejects when the secret is an empty string', () => {
    process.env.INTERNAL_API_SECRET = '';
    expect(isInternalRequest(req({ 'x-internal-secret': '' }))).toBe(false);
  });
});

describe('internalRequestHeaders', () => {
  it('returns the header when configured', () => {
    process.env.INTERNAL_API_SECRET = 'abc';
    expect(internalRequestHeaders()).toEqual({ 'x-internal-secret': 'abc' });
  });

  it('returns an empty object when not configured', () => {
    delete process.env.INTERNAL_API_SECRET;
    expect(internalRequestHeaders()).toEqual({});
  });

  it('round-trips: headers produced here are accepted by isInternalRequest', () => {
    process.env.INTERNAL_API_SECRET = 'round-trip-secret';
    expect(isInternalRequest(req(internalRequestHeaders()))).toBe(true);
  });
});
