import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design system token compliance', () => {
  it('uses only Geist and Geist Mono and enforces max semibold weight in tokens.json', () => {
    const raw = fs.readFileSync(
      path.resolve(__dirname, '../../../../packages/ui-tokens/tokens.json'),
      'utf8',
    );
    const tokens = JSON.parse(raw);
    expect(tokens.fonts.sans).toBe('Geist');
    expect(tokens.fonts.mono).toBe('Geist Mono');
    expect(tokens.fonts.maxWeight).toBe(600);
    expect(tokens.fonts.allowItalics).toBe(false);
    expect(Object.values(tokens.spacing)).toEqual([
      0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96,
    ]);
  });
});
