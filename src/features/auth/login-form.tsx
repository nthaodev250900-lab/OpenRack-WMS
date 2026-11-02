'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login } from '@/actions/auth';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/preference-controls';
export function LoginForm({ demo }: { demo: boolean }) {
  const t = useTranslations();
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <Box size={32} />
          OpenRack <span className="text-sm font-normal opacity-70">WMS</span>
        </div>
        <div className="max-w-lg">
          <div className="mb-10 grid grid-cols-4 gap-3 opacity-60" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`h-16 rounded-xl border border-current/30 ${i % 3 === 0 ? 'bg-sidebar-accent' : ''}`}
              />
            ))}
          </div>
          <h1 className="text-4xl font-semibold leading-snug tracking-tight">
            {t('authentication.intro')}
          </h1>
          <p className="mt-5 max-w-md text-base opacity-80">{t('authentication.description')}</p>
        </div>
        <p className="flex items-center gap-2 text-sm opacity-75">
          <ShieldCheck size={18} />
          {t('authentication.security')}
        </p>
      </div>
      <div className="flex flex-col bg-card">
        <div className="flex justify-end p-5">
          <LanguageSwitcher />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-20">
          <div className="mb-8 flex items-center gap-2 text-xl font-bold lg:hidden">
            <Box size={28} />
            OpenRack WMS
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{t('authentication.title')}</h2>
          <p className="mb-8 mt-3 text-muted-foreground">{t('authentication.subtitle')}</p>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const values = Object.fromEntries(new FormData(e.currentTarget));
              start(async () => {
                const result = await login(values);
                if (!result.ok) setError(t(`validation.${result.error}`));
              });
            }}
          >
            <Field htmlFor="login-email" label={t('common.email')}>
              <input
                id="login-email"
                name="email"
                type="email"
                className="field"
                autoComplete="username"
                required
                maxLength={254}
              />
            </Field>
            <Field htmlFor="login-password" label={t('common.password')}>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  className="field pr-12"
                  autoComplete="current-password"
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground"
                  aria-label={t(`common.${visible ? 'hidePassword' : 'showPassword'}`)}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {error && (
              <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={pending || demo}>
              {pending ? t('common.loading') : t('authentication.signIn')}
              <ArrowRight size={17} />
            </Button>
          </form>
          {demo && (
            <div className="mt-6 rounded-xl border border-border bg-muted p-4">
              <p className="mb-3 text-sm text-muted-foreground">{t('authentication.demoHint')}</p>
              <Link className="font-semibold underline underline-offset-4" href="/">
                {t('authentication.demoLink')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
