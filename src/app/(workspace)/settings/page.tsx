import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import { SettingsTabs } from '@/features/settings/settings-tabs';
import { WorkspaceSettings } from '@/features/settings/workspace-settings';
export default async function Page() {
  const user = await getUser();
  return (
    <>
      <SettingsTabs />
      <WorkspaceSettings
        name={user?.company.name ?? 'OpenRack'}
        timeZone={user?.company.timeZone ?? 'Asia/Ho_Chi_Minh'}
        canManage={isDemo || user?.role === 'ADMIN'}
      />
    </>
  );
}
