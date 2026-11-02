'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, ChevronRight, LogOut, UserRound } from 'lucide-react';
import { Sidebar, navItems } from './sidebar';
import { LanguageSwitcher } from './preference-controls';
import { Button } from '../ui/button';
import { logout } from '@/actions/auth';
export function AppShell({
  children,
  demo,
  user,
  company,
}: {
  children: React.ReactNode;
  demo: boolean;
  user: { name: string; role: string } | null;
  company: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const path = usePathname();
  const item = navItems.find((i) => i.href === path);
  const router = useRouter();
  useEffect(() => {
    const sync = () => {
      if (!document.hidden && path !== '/settings/appearance') router.refresh();
    };
    const timer = setInterval(sync, 60000);
    window.addEventListener('focus', sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', sync);
    };
  }, [path, router]);
  return (
    <>
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-50 rounded bg-card p-3 focus:not-sr-only"
      >
        {t('common.skip')}
      </a>
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        isAdmin={demo || user?.role === 'ADMIN'}
        company={company}
      />
      <div className="min-h-screen lg:ml-64">
        <header className="no-print sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="px-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={t('common.menu')}
            >
              <Menu size={22} />
            </Button>
            <span className="hidden text-muted-foreground sm:inline">{t('common.workspace')}</span>
            <ChevronRight size={14} className="hidden text-muted-foreground sm:block" />
            <span className="font-medium">
              {item ? t(`navigation.${item.key}`) : t('navigation.settings')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden h-7 border-l border-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <UserRound size={18} />
              </div>
              <div className="hidden text-xs sm:block">
                <p className="font-semibold">{user?.name ?? t('common.demoBadge')}</p>
                <p className="text-muted-foreground">
                  {user ? t(`users.${user.role}`) : 'OpenRack'}
                </p>
              </div>
            </div>
            {user && (
              <form action={logout}>
                <Button variant="ghost" className="px-2" aria-label={t('navigation.logout')}>
                  <LogOut size={18} />
                </Button>
              </form>
            )}
          </div>
        </header>
        {demo && (
          <div className="no-print border-b border-info/20 bg-info-soft px-5 py-2 text-xs text-info md:px-8">
            {t('common.demo')}
          </div>
        )}
        <main id="main" className="mx-auto max-w-[1600px] p-4 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
