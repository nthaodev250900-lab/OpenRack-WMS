'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Check, Palette, RotateCcw, Save, Eye } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ModeSwitcher, LanguageSwitcher } from '@/components/layout/preference-controls';
import { useToast } from '@/components/ui/toast';
import {
  defaultTheme,
  presets,
  themeSchema,
  themeVariables,
  paletteFor,
  foreground,
  contrast,
  type ThemeConfig,
} from '@/theme/palette';
import { saveOrganizationTheme } from '@/actions/preferences';
import { ThemePreview } from './theme-preview';
function applyToDocument(theme: ThemeConfig) {
  Object.entries(themeVariables(theme)).forEach(([key, value]) =>
    document.documentElement.style.setProperty(key, value),
  );
}
export function AppearancePage({
  initialTheme,
  canManage,
}: {
  initialTheme: ThemeConfig;
  canManage: boolean;
}) {
  const t = useTranslations();
  const f = useFormatter();
  const toast = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState(initialTheme);
  const savedRef = useRef(initialTheme);
  const [draft, setDraft] = useState(initialTheme);
  const [hex, setHex] = useState(initialTheme.primaryColor);
  const [resetOpen, setResetOpen] = useState(false);
  const [pending, start] = useTransition();
  const valid = themeSchema.safeParse({ ...draft, primaryColor: hex }).success;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const palette = paletteFor(draft);
  const ratio = contrast(palette[600], foreground(palette[600]));
  // Temporary "Apply" never leaks into other pages when the editor is abandoned.
  useEffect(() => () => applyToDocument(savedRef.current), []);
  function choose(theme: ThemeConfig) {
    setDraft(theme);
    setHex(theme.primaryColor);
  }
  function changeColor(value: string) {
    setHex(value);
    if (/^#[\da-fA-F]{6}$/.test(value))
      setDraft({ themePreset: 'custom', primaryColor: value.toLowerCase() });
  }
  function save() {
    start(async () => {
      const result = await saveOrganizationTheme(draft);
      if (!result.ok) {
        toast(t(`validation.${result.error}`), true);
        return;
      }
      setSaved(draft);
      savedRef.current = draft;
      applyToDocument(draft);
      toast(t('settings.saved'));
      router.refresh();
    });
  }
  return (
    <>
      <PageHeading
        title={t('settings.appearance')}
        description={t('settings.appearanceHint')}
        action={
          <div className="rounded-xl border border-border bg-card p-3 text-muted-foreground">
            <Palette size={24} strokeWidth={1.5} />
          </div>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,.85fr)_minmax(0,1.3fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader title={t('settings.brand')} description={t('settings.brandHint')} />
            <div className="space-y-6 px-5 pb-5">
              {!canManage && (
                <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
                  {t('settings.adminOnly')}
                </p>
              )}
              <fieldset disabled={!canManage || pending}>
                <legend className="mb-3 text-sm font-medium">{t('settings.preset')}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(presets).map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      className={`flex min-h-14 items-center gap-2 rounded-xl border p-3 text-left text-xs ${draft.themePreset === key ? 'border-ring bg-accent text-accent-foreground' : 'border-border hover:bg-muted'}`}
                      aria-pressed={draft.themePreset === key}
                      onClick={() =>
                        choose({
                          themePreset: key as ThemeConfig['themePreset'],
                          primaryColor: key === 'custom' ? draft.primaryColor : color,
                        })
                      }
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: color, color: foreground(color) }}
                      >
                        {draft.themePreset === key && <Check size={14} />}
                      </span>
                      <span className="flex-1">{t(`settings.${key}`)}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <Field htmlFor="brand-picker" label={t('settings.primaryColor')}>
                    <input
                      id="brand-picker"
                      type="color"
                      value={draft.primaryColor}
                      onChange={(e) => changeColor(e.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-input bg-card p-1"
                      aria-label={t('settings.picker')}
                    />
                  </Field>
                  <div className="flex-1">
                    <Field htmlFor="brand-hex" label={t('settings.hex')}>
                      <input
                        id="brand-hex"
                        className="field font-mono"
                        value={hex}
                        maxLength={7}
                        spellCheck={false}
                        aria-invalid={!valid}
                        aria-describedby={!valid ? 'hex-error' : undefined}
                        onChange={(e) => changeColor(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
                {!valid && (
                  <p id="hex-error" role="alert" className="mt-2 text-xs text-danger">
                    {t('validation.invalidColor')}
                  </p>
                )}
                <div className="mt-4 flex h-8 overflow-hidden rounded-lg" aria-hidden>
                  {Object.values(palette).map((color) => (
                    <div key={color} className="flex-1" style={{ background: color }} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t('settings.contrast', { ratio: f.number(ratio, { maximumFractionDigits: 2 }) })}
                </p>
              </fieldset>
              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                <Button
                  disabled={!canManage || !valid || pending}
                  onClick={() => {
                    applyToDocument(draft);
                    toast(t('settings.applied'));
                  }}
                  variant="secondary"
                >
                  <Eye size={16} />
                  {t('common.apply')}
                </Button>
                <Button disabled={!canManage || !valid || pending || !dirty} onClick={save}>
                  <Save size={16} />
                  {pending ? t('common.loading') : t('common.save')}
                </Button>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  variant="ghost"
                  disabled={!canManage || pending}
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw size={15} />
                  {t('common.reset')}
                </Button>
                <Button
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    choose(saved);
                    applyToDocument(saved);
                    toast(t('settings.cancelled'));
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title={t('settings.mode')} description={t('settings.modeHint')} />
            <div className="space-y-5 px-5 pb-5">
              <ModeSwitcher />
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-medium">{t('settings.language')}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-4 xl:sticky xl:top-28">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">{t('settings.preview')}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t('settings.previewHint')}</p>
            </div>
            {dirty && <Badge tone="warning">{t('settings.previewOnly')}</Badge>}
          </div>
          <ThemePreview theme={draft} />
        </div>
      </div>
      <Modal title={t('settings.resetTitle')} open={resetOpen} onClose={() => setResetOpen(false)}>
        <p className="text-sm text-muted-foreground">{t('settings.resetDescription')}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              choose(defaultTheme);
              setResetOpen(false);
            }}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
