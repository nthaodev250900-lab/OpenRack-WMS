import { beforeEach, describe, it, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  authorize: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  set: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getUser: mocks.getUser, authorize: mocks.authorize }));
vi.mock('@/lib/db', () => ({
  db: { user: { update: mocks.update }, themeSetting: { upsert: mocks.upsert } },
}));
vi.mock('next/headers', () => ({ cookies: async () => ({ set: mocks.set }) }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
import { savePreferences, saveOrganizationTheme } from '@/actions/preferences';
import { AppError } from '@/lib/errors';
import { defaultTheme, regentStBlue } from '@/theme/palette';
describe('preference and organization persistence', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.authorize.mockResolvedValue({ id: 'u1', companyId: 'c1', role: 'ADMIN' });
  });
  it('persists an authenticated language preference in DB and cookie', async () => {
    mocks.getUser.mockResolvedValue({ id: 'u1' });
    expect(await savePreferences({ locale: 'en-US' })).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { locale: 'en-US' } });
    expect(mocks.set).toHaveBeenCalledWith(
      'openrack-locale',
      'en-US',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
  it('persists anonymous language using only a cookie', async () => {
    mocks.getUser.mockResolvedValue(null);
    await savePreferences({ locale: 'vi-VN' });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).toHaveBeenCalled();
  });
  it.each(['light', 'dark', 'system'])(
    'persists personal %s mode separately',
    async (appearance) => {
      mocks.getUser.mockResolvedValue({ id: 'u1' });
      await savePreferences({ appearance });
      expect(mocks.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { appearance } });
      expect(mocks.upsert).not.toHaveBeenCalled();
    },
  );
  it('rejects unsupported preferences', async () => {
    expect(await savePreferences({ locale: 'fr' })).toEqual({ ok: false, error: 'invalid' });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('saves the company theme and generated palette with administrator identity', async () => {
    expect(await saveOrganizationTheme(defaultTheme)).toEqual({ ok: true });
    expect(mocks.authorize).toHaveBeenCalledWith(['ADMIN']);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'c1' },
        create: expect.objectContaining({
          companyId: 'c1',
          customPalette: regentStBlue,
          updatedById: 'u1',
        }),
      }),
    );
  });
  it('blocks non-admin theme writes before persistence', async () => {
    mocks.authorize.mockRejectedValue(new AppError('forbidden'));
    expect(await saveOrganizationTheme(defaultTheme)).toEqual({ ok: false, error: 'forbidden' });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('rejects invalid theme configuration before persistence', async () => {
    expect(await saveOrganizationTheme({ themePreset: 'custom', primaryColor: 'oops' })).toEqual({
      ok: false,
      error: 'invalidColor',
    });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
