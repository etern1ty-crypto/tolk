import { AnimatePresence, motion } from 'framer-motion';
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

export function Sheet({ open, onClose, children, title, label, wide }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          role="presentation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`${styles.sheet} ${wide ? styles.wide : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={label ?? title}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0.85 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className={styles.handle} />
            {title && <h3 className={styles.title}>{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
