import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import { getTheme } from '@/theme/server';
import { AppearancePage } from '@/features/settings/appearance-page';
import { SettingsTabs } from '@/features/settings/settings-tabs';
export default async function Page() {
  const user = await getUser();
  return (
    <>
      <SettingsTabs />
      <AppearancePage
        initialTheme={await getTheme()}
        canManage={isDemo || user?.role === 'ADMIN'}
      />
    </>
  );
}
