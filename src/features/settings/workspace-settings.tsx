'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { saveWorkspace } from '@/actions/warehouse';
import { PageHeading } from '@/components/ui/page-heading';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
export function WorkspaceSettings({
  name,
  timeZone,
  canManage,
}: {
  name: string;
  timeZone: string;
  canManage: boolean;
}) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  return (
    <>
      <PageHeading title={t('settings.general')} description={t('settings.description')} />
      <Card className="max-w-2xl p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const input = Object.fromEntries(new FormData(e.currentTarget));
            start(async () => {
              const result = await saveWorkspace(input);
              if (!result.ok) {
                setError(t(`validation.${result.error}`));
                return;
              }
              setError('');
              toast(t('notifications.saved'));
              router.refresh();
            });
          }}
        >
          <fieldset disabled={!canManage || pending} className="space-y-5">
            <Field htmlFor="company-name" label={t('settings.companyName')}>
              <input
                id="company-name"
                name="name"
                className="field"
                required
                defaultValue={name}
                maxLength={120}
              />
            </Field>
            <Field
              htmlFor="company-timezone"
              label={t('common.timezone')}
              hint={t('settings.timeZoneHint')}
            >
              <input
                id="company-timezone"
                name="timeZone"
                className="field"
                required
                defaultValue={timeZone}
                list="timezones"
                maxLength={100}
              />
              <datalist id="timezones">
                {Intl.supportedValuesOf('timeZone').map((zone) => (
                  <option key={zone} value={zone} />
                ))}
              </datalist>
            </Field>
            <Button disabled={pending}>
              {pending ? t('common.loading') : t('settings.saveGeneral')}
            </Button>
          </fieldset>
          {!canManage && <p className="text-sm text-muted-foreground">{t('common.readOnly')}</p>}
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
        </form>
      </Card>
    </>
  );
}
