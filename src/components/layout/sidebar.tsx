'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  LayoutDashboard,
  Warehouse,
  Layers3,
  PanelsTopLeft,
  Grid2X2,
  Package,
  ArrowLeftRight,
  QrCode,
  ChartNoAxesCombined,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
export const navItems = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'warehouses', href: '/warehouses', icon: Warehouse },
  { key: 'zones', href: '/zones', icon: Layers3 },
  { key: 'racks', href: '/racks', icon: PanelsTopLeft },
  { key: 'bins', href: '/bins', icon: Grid2X2 },
  { key: 'inventory', href: '/inventory', icon: Package },
  { key: 'stockMovements', href: '/stock-movements', icon: ArrowLeftRight },
  { key: 'qr', href: '/qr', icon: QrCode },
  { key: 'reports', href: '/reports', icon: ChartNoAxesCombined },
  { key: 'users', href: '/users', icon: Users },
  { key: 'settings', href: '/settings/appearance', icon: Settings },
] as const;
export function Sidebar({
  open,
  onClose,
  isAdmin,
  company,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  company: string;
}) {
  const t = useTranslations();
  const path = usePathname();
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-label={t('common.close')}
        />
      )}
      <aside
        aria-label={t('common.workspace')}
        className={clsx(
          'no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Box size={24} />
          </div>
          <Link href="/" className="text-xl font-bold tracking-tight">
            OpenRack<span className="ml-1 text-xs font-normal opacity-70">WMS</span>
          </Link>
          <button
            className="ml-auto min-h-11 px-2 lg:hidden"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mx-5 mb-5 rounded-lg border border-current/20 px-3 py-3">
          <p className="text-[10px] uppercase tracking-widest opacity-70">
            {t('common.workspace')}
          </p>
          <p className="mt-1 truncate font-medium">{company}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems
            .filter((i) => isAdmin || i.key !== 'users')
            .map((item, index) => {
              const active =
                item.href === '/'
                  ? path === '/'
                  : path.startsWith(item.href.split('/').slice(0, 2).join('/'));
              return (
                <div key={item.key}>
                  {(index === 0 || index === 5 || index === 9) && (
                    <p className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[.16em] opacity-60">
                      {t(
                        `common.${index === 0 ? 'workspace' : index === 5 ? 'operations' : 'administration'}`,
                      )}
                    </p>
                  )}
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm soft-transition',
                      active
                        ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={18} strokeWidth={1.7} />
                    {t(`navigation.${item.key}`)}
                  </Link>
                </div>
              );
            })}
        </nav>
        <div className="mx-5 mt-5 border-t border-current/20 py-5 text-xs opacity-70">
          OpenRack WMS · v0.1
        </div>
      </aside>
    </>
  );
}
