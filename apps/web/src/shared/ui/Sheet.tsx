import type { ReactNode } from 'react';
import { useEffect } from 'react';
import styles from './Sheet.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  label?: string;
  wide?: boolean;
};

/** CSS-only sheet — no spring layout thrash */
export function Sheet({ open, onClose, children, title, label, wide }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`${styles.sheet} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        {title && <h3 className={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
