export class AppError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}
export type ActionResult = { ok: true } | { ok: false; error: string };
export function actionError(error: unknown): ActionResult {
  if (error instanceof AppError) return { ok: false, error: error.code };
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
    return { ok: false, error: 'duplicate' };
  console.error('[OpenRack] Action failed', error);
  return { ok: false, error: 'unexpected' };
}
