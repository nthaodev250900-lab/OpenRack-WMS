'use client';
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
type Notice = { text: string; error: boolean };
const ToastContext = createContext<(text: string, error?: boolean) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string, error = false) => {
    if (timer.current) clearTimeout(timer.current);
    setNotice({ text, error });
    timer.current = setTimeout(() => setNotice(null), 6000);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        className="no-print fixed bottom-6 right-6 z-50 max-w-sm"
        aria-live="polite"
        role="status"
      >
        {notice && (
          <div className="panel flex items-center gap-3 p-4 shadow-lg">
            {notice.error ? (
              <TriangleAlert className="shrink-0 text-danger" size={20} />
            ) : (
              <CircleCheck className="shrink-0 text-success" size={20} />
            )}
            <p>{notice.text}</p>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
