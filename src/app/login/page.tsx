import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import { LoginForm } from '@/features/auth/login-form';
export default async function Page() {
  if (await getUser()) redirect('/');
  return <LoginForm demo={isDemo} />;
}
