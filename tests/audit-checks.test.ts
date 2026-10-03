import { describe, expect, it } from 'vitest';
import { blockedAiBots } from '@/lib/audits/checks';

describe('blockedAiBots', () => {
  it('allows everyone when robots.txt disallows nothing', () => {
    expect(blockedAiBots('User-agent: *\nDisallow:\n')).toEqual([]);
  });

  it('blocks every AI bot when * is shut out of the whole site', () => {
    expect(blockedAiBots('User-agent: *\nDisallow: /\n')).toContain('GPTBot');
  });

  it('reads a group naming the bot instead of falling back to *', () => {
    const robots = 'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n';
    const blocked = blockedAiBots(robots);
    expect(blocked).not.toContain('GPTBot');
    expect(blocked).toContain('ClaudeBot');
  });

  it('treats consecutive user-agent lines as one group', () => {
    const robots = 'User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n';
    expect(blockedAiBots(robots)).toEqual(['GPTBot', 'ClaudeBot']);
  });

  it('ignores partial disallows and comments', () => {
    expect(blockedAiBots('User-agent: GPTBot # openai\nDisallow: /admin\n')).toEqual([]);
  });
});
