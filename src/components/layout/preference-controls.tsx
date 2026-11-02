'use client';
import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Languages, Sun, Moon, Monitor } from 'lucide-react';
import { savePreferences } from '@/actions/preferences';
import { useToast } from '@/components/ui/toast';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-muted-foreground">
      <Languages size={17} aria-hidden />
      <span className="sr-only">{t('settings.language')}</span>
      <select
        className="min-h-11 max-w-32 rounded-lg bg-card px-2 text-sm text-foreground"
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const value = event.target.value;
          start(async () => {
            const result = await savePreferences({ locale: value });
            if (!result.ok) toast(t(`validation.${result.error}`), true);
            else router.refresh();
          });
        }}
      >
        <option value="vi-VN">Tiếng Việt</option>
        <option value="en-US">English</option>
      </select>
    </label>
  );
}
export function ModeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <div
      className="flex gap-1 rounded-xl border border-border bg-muted p-1"
      role="group"
      aria-label={t('settings.mode')}
    >
      {(['light', 'dark', 'system'] as const).map((mode) => {
        const Icon = { light: Sun, dark: Moon, system: Monitor }[mode];
        return (
          <button
            key={mode}
            disabled={pending}
            aria-label={t(`settings.${mode}`)}
            aria-pressed={theme === mode}
            className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm ${theme === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => {
              start(async () => {
                const result = await savePreferences({ appearance: mode });
                if (result.ok) {
                  setTheme(mode);
                  toast(t('settings.personalSaved'));
                } else toast(t(`validation.${result.error}`), true);
              });
            }}
          >
            <Icon size={16} />
            <span>{t(`settings.${mode}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
