'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { createEntity } from '@/actions/warehouse';
import type { WarehouseData, EntityKind } from './types';
export function EntityForm({
  kind,
  data,
  onDone,
}: {
  kind: EntityKind;
  data: WarehouseData;
  onDone: () => void;
}) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const parents =
    kind === 'zones'
      ? data.warehouses
      : kind === 'racks'
        ? data.zones
        : kind === 'bins'
          ? data.racks
          : [];
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.currentTarget));
    start(async () => {
      const result = await createEntity(kind, input);
      if (!result.ok) {
        setError(t(`validation.${result.error}`));
        return;
      }
      toast(t('notifications.created'));
      router.refresh();
      onDone();
    });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      {kind !== 'users' && (
        <Field
          htmlFor="entity-code"
          label={kind === 'inventory' ? t('inventory.sku') : t('common.code')}
        >
          <input
            id="entity-code"
            className="field"
            name="code"
            required
            maxLength={40}
            pattern="[A-Za-z0-9_\-]+"
          />
        </Field>
      )}
      <Field htmlFor="entity-name" label={t('common.name')}>
        <input id="entity-name" className="field" name="name" required maxLength={120} />
      </Field>
      {kind === 'warehouses' && (
        <Field htmlFor="entity-address" label={t('common.address')}>
          <input id="entity-address" className="field" name="address" maxLength={250} />
        </Field>
      )}
      {['zones', 'racks', 'bins'].includes(kind) && (
        <Field htmlFor="entity-parent" label={t('common.parent')}>
          <select id="entity-parent" className="field" name="parentId" required>
            <option value="">{t('common.select')}</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {kind === 'bins' && (
        <Field htmlFor="entity-capacity" label={t('common.capacity')}>
          <input
            id="entity-capacity"
            className="field"
            name="capacity"
            type="number"
            min={1}
            max={100000000}
            defaultValue={1000}
            required
          />
        </Field>
      )}
      {kind === 'inventory' && (
        <Field htmlFor="entity-min" label={t('inventory.minStock')}>
          <input
            id="entity-min"
            className="field"
            name="minStock"
            type="number"
            min={0}
            max={100000000}
            defaultValue={10}
            required
          />
        </Field>
      )}
      {kind === 'users' && (
        <>
          <Field htmlFor="entity-email" label={t('common.email')}>
            <input
              id="entity-email"
              className="field"
              name="email"
              type="email"
              required
              maxLength={254}
            />
          </Field>
          <Field
            htmlFor="entity-password"
            label={t('common.password')}
            hint={t('users.passwordHint')}
          >
            <input
              id="entity-password"
              className="field"
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field htmlFor="entity-role" label={t('common.role')}>
            <select id="entity-role" className="field" name="role" defaultValue="VIEWER">
              {['VIEWER', 'OPERATOR', 'ADMIN'].map((role) => (
                <option key={role} value={role}>
                  {t(`users.${role}`)}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}
      {error && (
        <p role="alert" className="rounded bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-3">
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button disabled={pending}>{pending ? t('common.loading') : t('common.save')}</Button>
      </div>
    </form>
  );
}
