'use client';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';
import { ToastProvider } from './ui/toast';
export function Providers({
  children,
  appearance,
}: {
  children: React.ReactNode;
  appearance: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={appearance}
      enableSystem
      storageKey="openrack-appearance"
      disableTransitionOnChange
    >
      <AppearanceSync appearance={appearance} />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

function AppearanceSync({ appearance }: { appearance: string }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(appearance);
  }, [appearance, setTheme]);
  return null;
}
