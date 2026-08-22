import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HONEYPOT_FIELD_NAME,
  validateHoneypot,
  validateSubmissionTime,
  generateTimestamp,
} from '@/lib/security/honeypot';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('HONEYPOT_FIELD_NAME', () => {
  it('carries the website_url_ prefix the server matches on', () => {
    expect(HONEYPOT_FIELD_NAME.startsWith('website_url_')).toBe(true);
    expect(HONEYPOT_FIELD_NAME.length).toBeGreaterThan('website_url_'.length);
  });
});

describe('validateHoneypot — plain object payload (JSON APIs)', () => {
  it('accepts a normal payload', () => {
    expect(validateHoneypot({ name: 'Jan', email: 'jan@example.com' })).toBe(true);
  });

  it('accepts an empty payload', () => {
    expect(validateHoneypot({})).toBe(true);
  });

  it('accepts an empty / whitespace-only honeypot field', () => {
    expect(validateHoneypot({ [HONEYPOT_FIELD_NAME]: '' })).toBe(true);
    expect(validateHoneypot({ [HONEYPOT_FIELD_NAME]: '   ' })).toBe(true);
  });

  it('rejects a filled honeypot field', () => {
    expect(validateHoneypot({ [HONEYPOT_FIELD_NAME]: 'http://spam.example' })).toBe(false);
  });

  it('matches on the prefix, not the exact random name (client/server bundles differ)', () => {
    // A different nanoid suffix than this process generated must still be caught.
    expect(validateHoneypot({ website_url_ABC123: 'spam' })).toBe(false);
    expect(validateHoneypot({ website_url_: 'spam' })).toBe(false);
  });

  it('ignores unrelated fields that merely contain the word url', () => {
    expect(validateHoneypot({ existingWebsite: 'https://real-client.cz', websiteUrl: 'x' })).toBe(true);
  });

  it('ignores non-string honeypot values', () => {
    expect(validateHoneypot({ website_url_x: 123 as any })).toBe(true);
    expect(validateHoneypot({ website_url_x: null as any })).toBe(true);
  });
});

describe('validateHoneypot — FormData payload', () => {
  it('accepts clean FormData', () => {
    const fd = new FormData();
    fd.append('name', 'Jan');
    expect(validateHoneypot(fd)).toBe(true);
  });

  it('rejects FormData with a filled honeypot', () => {
    const fd = new FormData();
    fd.append('name', 'Jan');
    fd.append('website_url_zzz', 'spam');
    expect(validateHoneypot(fd)).toBe(false);
  });
});

describe('validateSubmissionTime', () => {
  it('rejects a submission that is instant (bot)', () => {
    expect(validateSubmissionTime(Date.now(), 3)).toBe(false);
  });

  it('rejects anything under the minimum', () => {
    expect(validateSubmissionTime(Date.now() - 2_900, 3)).toBe(false);
  });

  it('accepts a human-paced submission', () => {
    expect(validateSubmissionTime(Date.now() - 10_000, 3)).toBe(true);
    expect(validateSubmissionTime(String(Date.now() - 30_000), 3)).toBe(true);
  });

  it('rejects a stale timestamp (> 24 hours)', () => {
    expect(validateSubmissionTime(Date.now() - 86_400_001, 3)).toBe(false);
  });

  it('accepts a timestamp just inside the 24 hour window', () => {
    expect(validateSubmissionTime(Date.now() - 86_000_000, 3)).toBe(true);
  });

  it('accepts a form left open for hours instead of silently dropping the lead', () => {
    expect(validateSubmissionTime(Date.now() - 3_600_001, 3)).toBe(true);
    expect(validateSubmissionTime(Date.now() - 8 * 3_600_000, 3)).toBe(true);
  });

  it('rejects a future timestamp (negative age is below the minimum)', () => {
    expect(validateSubmissionTime(Date.now() + 60_000, 3)).toBe(false);
  });

  // REGRESSION (lib/security/honeypot.ts): parseInt('abc') -> NaN, and both
  // `NaN < min` and `NaN > max` are false, so the function used to return true.
  // A bot that posts __form_timestamp: "abc" skipped the timing check entirely.
  it('rejects unparsable input', () => {
    expect(validateSubmissionTime('not-a-number', 3)).toBe(false);
  });

  it('rejects NaN and Infinity', () => {
    expect(validateSubmissionTime(NaN, 3)).toBe(false);
    expect(validateSubmissionTime(Infinity, 3)).toBe(false);
    expect(validateSubmissionTime(-Infinity, 3)).toBe(false);
  });

  it('rejects an empty timestamp string (callers also guard with a truthy check)', () => {
    expect(validateSubmissionTime('', 3)).toBe(false);
  });

  it('generateTimestamp produces a value that is immediately too fresh', () => {
    expect(validateSubmissionTime(generateTimestamp(), 3)).toBe(false);
  });
});
