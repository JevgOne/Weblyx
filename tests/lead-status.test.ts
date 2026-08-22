import { describe, it, expect } from 'vitest';
import {
  LEAD_STATUSES,
  LEAD_STATUS_OPTIONS,
  LEGACY_DONE_STATUS,
  canonicalLeadStatus,
  leadStatusMeta,
  nextLeadStatus,
  isWritableLeadStatus,
} from '@/lib/leads/status';

describe('status cycle', () => {
  it('cycles new -> in_progress -> done -> new', () => {
    expect(nextLeadStatus('new')).toBe('in_progress');
    expect(nextLeadStatus('in_progress')).toBe('done');
    expect(nextLeadStatus('done')).toBe('new');
  });

  it('returns to the start after exactly 3 clicks', () => {
    let s: string = 'new';
    for (let i = 0; i < 3; i++) s = nextLeadStatus(s);
    expect(s).toBe('new');
  });

  it('never emits the legacy "converted" value', () => {
    const seen = new Set<string>();
    let s: string = 'converted';
    for (let i = 0; i < 12; i++) {
      s = nextLeadStatus(s);
      seen.add(s);
    }
    expect(seen.has(LEGACY_DONE_STATUS)).toBe(false);
    expect([...seen].sort()).toEqual(['done', 'in_progress', 'new']);
  });

  it('treats "converted" as done, so the next click goes to new', () => {
    expect(nextLeadStatus('converted')).toBe('new');
  });

  it('falls back to the start of the cycle for junk input', () => {
    for (const junk of ['', 'won', 'completed', 'qualified', null, undefined, 42, {}]) {
      expect(nextLeadStatus(junk as any)).toBe('in_progress'); // junk -> "new" -> next is in_progress
    }
  });
});

describe('canonicalLeadStatus', () => {
  it('maps the legacy value onto done', () => {
    expect(canonicalLeadStatus('converted')).toBe('done');
  });

  it('passes the three canonical values through', () => {
    for (const s of LEAD_STATUSES) expect(canonicalLeadStatus(s)).toBe(s);
  });

  it('returns null for anything else, including non-strings', () => {
    for (const junk of ['', 'won', 'NEW', ' new ', null, undefined, 0, 1, {}, []]) {
      expect(canonicalLeadStatus(junk as any)).toBeNull();
    }
  });
});

describe('leadStatusMeta — must never throw (was the statusConfig[x].color crash)', () => {
  it('renders converted as "Hotovo"', () => {
    const meta = leadStatusMeta('converted');
    expect(meta.value).toBe('done');
    expect(meta.label).toBe('Hotovo');
  });

  it('always returns usable class strings for unknown input', () => {
    for (const junk of ['', 'won', 'garbage', null, undefined, 123, {}, [], NaN]) {
      const meta = leadStatusMeta(junk as any);
      expect(typeof meta.pillClass).toBe('string');
      expect(meta.pillClass.length).toBeGreaterThan(0);
      expect(typeof meta.badgeClass).toBe('string');
      expect(meta.badgeClass.length).toBeGreaterThan(0);
      expect(meta.value).toBeNull();
    }
  });

  it('shows the raw value as the label for an unrecognised non-empty string', () => {
    expect(leadStatusMeta('won').label).toBe('won');
    expect(leadStatusMeta('').label).toBe('Neznámý');
    expect(leadStatusMeta(null).label).toBe('Neznámý');
  });

  it('labels the canonical statuses in Czech', () => {
    expect(leadStatusMeta('new').label).toBe('Nová');
    expect(leadStatusMeta('in_progress').label).toBe('V řešení');
    expect(leadStatusMeta('done').label).toBe('Hotovo');
  });
});

describe('isWritableLeadStatus (API whitelist)', () => {
  it('accepts the three canonical statuses', () => {
    for (const s of LEAD_STATUSES) expect(isWritableLeadStatus(s)).toBe(true);
  });

  it('rejects arbitrary values (no free-text status writes)', () => {
    for (const junk of ['', 'won', 'completed', 'deleted', null, undefined, 1, {}]) {
      expect(isWritableLeadStatus(junk as any)).toBe(false);
    }
  });

  it('DOCUMENTS current behaviour: the legacy "converted" value is still accepted on write', () => {
    // The convert endpoint needs it; the UI cycle never produces it (see above).
    expect(isWritableLeadStatus('converted')).toBe(true);
  });
});

describe('LEAD_STATUS_OPTIONS (filter UI)', () => {
  it('offers exactly the three canonical statuses in cycle order', () => {
    expect(LEAD_STATUS_OPTIONS.map((o) => o.value)).toEqual(['new', 'in_progress', 'done']);
    expect(LEAD_STATUS_OPTIONS.every((o) => o.label && o.pillClass && o.badgeClass)).toBe(true);
  });
});
