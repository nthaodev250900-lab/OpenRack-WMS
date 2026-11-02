'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Download, Printer, Search, QrCode } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Button, buttonClass } from '@/components/ui/button';
import type { Bin } from '@/features/warehouse/types';
export function QrPage({ bins }: { bins: Bin[] }) {
  const t = useTranslations();
  const params = useSearchParams();
  const router = useRouter();
  const selected = bins.find((b) => b.code === params.get('bin')) ?? bins[0];
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (selected)
      QRCode.toDataURL(selected.code, { width: 512, margin: 3, errorCorrectionLevel: 'M' })
        .then((value) => {
          if (active) setImage(value);
        })
        .catch(() => {
          if (active) setError(t('validation.unexpected'));
        });
    return () => {
      active = false;
    };
  }, [selected, t]);
  return (
    <>
      <PageHeading title={t('qr.title')} description={t('qr.description')} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="no-print space-y-6 p-6">
          <Field htmlFor="qr-bin" label={t('common.bin')} hint={t('qr.select')}>
            <select
              id="qr-bin"
              className="field"
              value={selected?.code ?? ''}
              onChange={(e) => router.replace(`/qr?bin=${encodeURIComponent(e.target.value)}`)}
            >
              {bins.map((b) => (
                <option key={b.id} value={b.code}>
                  {b.code} · {b.name}
                </option>
              ))}
            </select>
          </Field>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = String(new FormData(e.currentTarget).get('code')).trim();
              if (bins.some((b) => b.code === value)) {
                setError('');
                router.replace(`/qr?bin=${encodeURIComponent(value)}`);
              } else setError(t('qr.notFound'));
            }}
            className="space-y-3"
          >
            <Field htmlFor="qr-lookup" label={t('qr.lookup')} hint={t('qr.lookupHint')}>
              <input id="qr-lookup" name="code" className="field" required />
            </Field>
            <Button variant="secondary">
              <Search size={16} />
              {t('qr.lookup')}
            </Button>
          </form>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {image && (
              <a href={image} download={`${selected?.code}.png`} className={buttonClass()}>
                <Download size={16} />
                {t('qr.download')}
              </a>
            )}
            <Button variant="secondary" onClick={() => window.print()} disabled={!image}>
              <Printer size={16} />
              {t('qr.print')}
            </Button>
          </div>
        </Card>
        <Card className="flex min-h-80 flex-col items-center justify-center p-8">
          {image && selected ? (
            <>
              <Image
                unoptimized
                src={image}
                alt={`${t('qr.identifier')}: ${selected.code}`}
                width={240}
                height={240}
              />
              <p className="mt-4 font-mono text-lg font-semibold">{selected.code}</p>
              <p className="mt-1 text-sm text-muted-foreground">{selected.name}</p>
            </>
          ) : (
            <>
              <QrCode size={48} className="text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('common.empty')}</p>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
