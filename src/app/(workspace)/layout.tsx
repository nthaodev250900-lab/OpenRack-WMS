import { AppShell } from '@/components/layout/app-shell';
import { getUser, requireUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = isDemo ? await getUser() : await requireUser();
  return (
    <AppShell
      demo={isDemo}
      user={user ? { name: user.name, role: user.role } : null}
      company={user?.company.name ?? 'OpenRack'}
    >
      {children}
    </AppShell>
  );
}
