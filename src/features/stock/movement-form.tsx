'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createMovement } from '@/actions/warehouse';
import type { WarehouseData } from '@/features/warehouse/types';
export function MovementForm({
  data,
  initialType,
  onDone,
}: {
  data: WarehouseData;
  initialType: string;
  onDone: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState(
    ['RECEIVE', 'ISSUE', 'TRANSFER'].includes(initialType) ? initialType : 'RECEIVE',
  );
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.currentTarget));
    start(async () => {
      const result = await createMovement(input);
      if (!result.ok) {
        setError(t(`validation.${result.error}`));
        return;
      }
      toast(t('notifications.movementPosted'));
      router.refresh();
      onDone();
    });
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <Field htmlFor="movement-type" label={t('common.type')}>
        <select
          id="movement-type"
          name="type"
          className="field"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {['RECEIVE', 'ISSUE', 'TRANSFER'].map((value) => (
            <option key={value} value={value}>
              {t(`stockMovements.${value}`)}
            </option>
          ))}
        </select>
      </Field>
      <Field htmlFor="movement-product" label={t('common.product')}>
        <select id="movement-product" name="productId" className="field" required>
          <option value="">{t('common.select')}</option>
          {data.products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} · {p.name}
            </option>
          ))}
        </select>
      </Field>
      {(type === 'RECEIVE' ? ['target'] : type === 'ISSUE' ? ['source'] : ['source', 'target']).map(
        (key) => (
          <Field key={key} htmlFor={`movement-${key}`} label={t(`common.${key}`)}>
            <select
              id={`movement-${key}`}
              name={key === 'source' ? 'sourceBinId' : 'targetBinId'}
              className="field"
              required
            >
              <option value="">{t('common.select')}</option>
              {data.bins.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code}
                </option>
              ))}
            </select>
          </Field>
        ),
      )}
      <Field htmlFor="movement-quantity" label={t('common.quantity')}>
        <input
          id="movement-quantity"
          name="quantity"
          type="number"
          min={1}
          max={100000000}
          step={1}
          className="field"
          required
        />
      </Field>
      <Field htmlFor="movement-note" label={t('common.note')}>
        <textarea id="movement-note" name="note" maxLength={1000} className="field" rows={3} />
      </Field>
      <p className="text-xs text-muted-foreground">{t('stockMovements.immutable')}</p>
      {error && (
        <p role="alert" className="rounded bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button disabled={pending}>
          {pending ? t('common.loading') : t('stockMovements.submit')}
        </Button>
      </div>
    </form>
  );
}
