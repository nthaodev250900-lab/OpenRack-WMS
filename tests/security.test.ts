import { describe, it, expect } from 'vitest';
import { assertRole, hashToken } from '@/lib/auth';
import { csvCell } from '@/lib/export';
describe('security boundaries', () => {
  it('enforces administrator authorization on server', () => {
    expect(() => assertRole('VIEWER', ['ADMIN'])).toThrow('forbidden');
    expect(() => assertRole('OPERATOR', ['ADMIN'])).toThrow('forbidden');
    expect(() => assertRole('ADMIN', ['ADMIN'])).not.toThrow();
  });
  it('stores a deterministic SHA-256 hash instead of a raw session token', () => {
    expect(hashToken('sample')).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken('sample')).not.toBe('sample');
    expect(hashToken('sample')).toBe(hashToken('sample'));
  });
  it.each(['=SUM(1,1)', '+CMD', '-1+1', '@SUM(A1)', '\t=1'])(
    'neutralizes CSV formula injection %s',
    (value) => {
      expect(csvCell(value)).toBe(`"'${value}"`);
    },
  );
  it('escapes quotes and commas in CSV', () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
  });
});
