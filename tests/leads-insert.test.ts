/**
 * Static shape check of the lead INSERT. A mismatch between the column list,
 * the placeholders and the args array writes values into the wrong columns
 * without any error, so it is worth asserting on the source text itself.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '..', 'app/api/leads/route.ts'), 'utf8');

const insertBlock = SRC.match(/INSERT INTO leads \(([\s\S]*?)\)\s*VALUES \(([\s\S]*?)\)\s*`/)!;
const columns = insertBlock[1].split(',').map((c) => c.trim()).filter(Boolean);
const values = insertBlock[2].split(',').map((v) => v.trim()).filter(Boolean);
const argsBlock = SRC.match(/args: \[([\s\S]*?)\n\s{6}\],/)![1];
const args = argsBlock
  .split('\n')
  .map((l) => l.trim().replace(/,$/, ''))
  .filter(Boolean);

describe('app/api/leads/route.ts INSERT', () => {
  it('placeholders + literals cover every column exactly once', () => {
    expect(values).toHaveLength(columns.length);
  });

  it('has 33 placeholders and 33 args', () => {
    expect(values.filter((v) => v === '?')).toHaveLength(33);
    expect(args).toHaveLength(33);
  });

  it('the only non-placeholder values are the two unixepoch() timestamps', () => {
    const literals = values.filter((v) => v !== '?');
    expect(literals).toEqual(['unixepoch()', 'unixepoch()']);
    expect(columns.slice(-2)).toEqual(['created_at', 'updated_at']);
  });

  it('column order matches the expected schema order', () => {
    expect(columns).toEqual([
      'id', 'name', 'email', 'phone', 'company', 'project_type',
      'project_type_other', 'project_goal', 'project_reason',
      'business_description', 'existing_website', 'company_size', 'industry',
      'ico', 'address', 'years_in_business', 'social_media',
      'customer_acquisition', 'usp', 'top_competitors',
      'project_details', 'features', 'design_preferences', 'marketing_tech',
      'budget_range', 'timeline', 'additional_requirements',
      'how_did_you_hear', 'preferred_contact', 'preferred_meeting_time',
      'configuration', 'status', 'source', 'created_at', 'updated_at',
    ]);
  });

  it('the configuration column is fed by leadConfiguration, not by a stray field', () => {
    const idx = columns.indexOf('configuration');
    expect(args[idx]).toContain('leadConfiguration');
  });

  it('status and source are hardcoded literals at the end of the args list', () => {
    expect(args[columns.indexOf('status')]).toBe('"new"');
    expect(args[columns.indexOf('source')]).toBe('"questionnaire"');
  });

  it('no column name is repeated', () => {
    expect(new Set(columns).size).toBe(columns.length);
  });
});

describe('lead POST guards', () => {
  it('rejects a submission without GDPR consent', () => {
    expect(SRC).toMatch(/if \(!gdprConsent\)[\s\S]{0,200}status: 400/);
  });

  it('runs honeypot and timing checks before validation', () => {
    const honeypotAt = SRC.indexOf('validateHoneypot(body)');
    const timeAt = SRC.indexOf('validateSubmissionTime(__form_timestamp');
    const gdprAt = SRC.indexOf('!gdprConsent');
    const insertAt = SRC.indexOf('INSERT INTO leads');
    expect(honeypotAt).toBeGreaterThan(-1);
    expect(honeypotAt).toBeLessThan(gdprAt);
    expect(timeAt).toBeLessThan(gdprAt);
    expect(gdprAt).toBeLessThan(insertAt);
  });

  it('recomputes the price server-side from IDs and never trusts a client price', () => {
    expect(SRC).toContain('buildConfiguration(pricing, tierId, addonIds)');
    expect(SRC).not.toMatch(/configuration\.(totalPrice|price|hours|totalHours)/);
  });

  it('fires the AI generation inside after() with the internal secret header', () => {
    expect(SRC).toContain('after(async () => {');
    expect(SRC).toContain('internalRequestHeaders()');
    expect(SRC).toContain('headers: internalHeaders');
  });
});
