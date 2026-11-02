'use client';
import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './button';
export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useTranslations('common');
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
    >
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <Button variant="ghost" onClick={onClose} aria-label={t('close')}>
          <X size={18} />
        </Button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
