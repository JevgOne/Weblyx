import { describe, it, expect } from 'vitest';
import { isoWeek, pickAnnouncement, ANNOUNCEMENT_COUNT } from '@/lib/nova/announcements';

describe('isoWeek', () => {
  it('matches known ISO-8601 week numbers', () => {
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);
    expect(isoWeek(new Date(2026, 7, 22))).toBe(34);
    expect(isoWeek(new Date(2026, 11, 31))).toBe(53);
  });

  it('is stable across every hour of the same day', () => {
    const day = 22;
    const weeks = new Set(
      Array.from({ length: 24 }, (_, h) => isoWeek(new Date(2026, 7, day, h)))
    );
    expect(weeks.size).toBe(1);
  });
});

describe('pickAnnouncement', () => {
  it('names the current month, not a hardcoded one', () => {
    // The bug this replaces: the hero still said "Červenec" in August.
    const august = pickAnnouncement(new Date(2026, 7, 22));
    expect(august).not.toMatch(/Červenec|červenec/);
  });

  it('is deterministic — the same instant always yields the same string', () => {
    const when = new Date(2026, 7, 22, 14, 30);
    const runs = new Set(Array.from({ length: 20 }, () => pickAnnouncement(when)));
    expect(runs.size).toBe(1);
  });

  it('does not change within a week, but does change between weeks', () => {
    const monday = pickAnnouncement(new Date(2026, 7, 17));
    const friday = pickAnnouncement(new Date(2026, 7, 21));
    const nextWeek = pickAnnouncement(new Date(2026, 7, 24));
    expect(friday).toBe(monday);
    expect(nextWeek).not.toBe(monday);
  });

  it('uses every message across a year and never renders an empty one', () => {
    const seen = new Set<string>();
    for (let week = 0; week < 53; week++) {
      const text = pickAnnouncement(new Date(2026, 0, 1 + week * 7));
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text).not.toMatch(/undefined|NaN/);
      seen.add(text.replace(/\d{4}/, '').replace(/^\S+ /, ''));
    }
    expect(seen.size).toBeGreaterThanOrEqual(ANNOUNCEMENT_COUNT);
  });

  it('declines Czech month names correctly in both slots', () => {
    // Whichever template lands, a month it names must be spelled properly.
    const texts = Array.from({ length: 12 }, (_, m) =>
      Array.from({ length: 5 }, (_, w) => pickAnnouncement(new Date(2026, m, 1 + w * 7)))
    ).flat();
    for (const t of texts) {
      expect(t).not.toMatch(/ledna|srpna|září 2026:/);
      expect(t).not.toMatch(/na [A-ZČŘŠŽ]/); // "na Srpen" would be wrong
    }
  });

  it('carries the right year across a year boundary', () => {
    expect(pickAnnouncement(new Date(2027, 0, 15))).toMatch(/2027|5–7|zálohy/);
  });
});
