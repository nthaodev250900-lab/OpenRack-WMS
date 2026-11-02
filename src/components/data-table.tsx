'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations, useFormatter } from 'next-intl';
import { Search, Download, Printer, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { downloadCsv } from '@/lib/export';
import { Badge } from './ui/badge';
export type TableColumn = { key: string; label: string };
export type TableRow = {
  id: string;
  values: Record<string, string | number>;
  status?: 'healthy' | 'low' | 'active' | 'full';
};
export function DataTable({
  columns,
  rows,
  filename = 'openrack',
  exportable = false,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  filename?: string;
  exportable?: boolean;
}) {
  const t = useTranslations('common');
  const f = useFormatter();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const filtered = rows.filter(
    (row) =>
      (!query ||
        Object.values(row.values)
          .join(' ')
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase())) &&
      (!status || row.status === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1));
  const visible = filtered.slice((page - 1) * 10, page * 10);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.replace(`${path}?${next}`, { scroll: false });
  }
  return (
    <div className="panel overflow-hidden">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4">
        <label className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <span className="sr-only">{t('search')}</span>
          <input
            className="field pl-10"
            placeholder={t('search')}
            value={query}
            onChange={(e) => update('q', e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {rows.some((row) => row.status) && (
            <label>
              <span className="sr-only">{t('status')}</span>
              <select
                className="field"
                value={status}
                onChange={(e) => update('status', e.target.value)}
              >
                <option value="">{t('all')}</option>
                {[...new Set(rows.map((row) => row.status).filter(Boolean))].map((s) => (
                  <option key={s} value={s}>
                    {t(s!)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {exportable && (
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  downloadCsv(
                    `${filename}.csv`,
                    columns.map((c) => c.label),
                    filtered.map((row) => columns.map((c) => row.values[c.key] ?? '')),
                  )
                }
              >
                <Download size={16} />
                {t('export')}
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer size={16} />
                {t('print')}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
              {rows.some((r) => r.status) && <th scope="col">{t('status')}</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {columns.map((c, index) => (
                  <td key={c.key} className={index === 0 ? 'font-medium' : ''}>
                    {typeof row.values[c.key] === 'number'
                      ? f.number(row.values[c.key] as number)
                      : row.values[c.key]}
                  </td>
                ))}
                {rows.some((r) => r.status) && (
                  <td>
                    {row.status && (
                      <Badge
                        tone={row.status === 'low' || row.status === 'full' ? 'warning' : 'success'}
                      >
                        {t(row.status)}
                      </Badge>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <div className="p-14 text-center">
          <PackageOpen className="mx-auto mb-4 text-muted-foreground" size={36} strokeWidth={1.4} />
          <p className="font-medium">{t('empty')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('emptyHint')}</p>
        </div>
      )}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span>
          {t('total')}: {f.number(filtered.length)}
        </span>
        <div className="flex items-center gap-3">
          <span>{t('page', { page, total: pages })}</span>
          <Button
            variant="ghost"
            className="px-2"
            disabled={page <= 1}
            onClick={() => update('page', String(page - 1))}
            aria-label={t('previous')}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            className="px-2"
            disabled={page >= pages}
            onClick={() => update('page', String(page + 1))}
            aria-label={t('next')}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
