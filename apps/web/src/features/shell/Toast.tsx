import { createPortal } from 'react-dom';
import { Toaster } from 'sonner';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import styles from './Toast.module.css';

/** One root-level Sonner queue; every existing showToast caller now stacks. */
export function Toast() {
  const theme = useAppStore((s) => s.uiTheme);
  const desktop = useIsDesktop();
  return createPortal(
    <Toaster
      theme={theme === 'light' ? 'light' : 'dark'}
      className={styles.toaster}
      position={desktop ? 'bottom-right' : 'top-center'}
      visibleToasts={3}
      closeButton
      gap={8}
      duration={4000}
      offset={24}
      mobileOffset={{ top: 'max(16px, env(safe-area-inset-top))', left: 16, right: 16 }}
      swipeDirections={desktop ? ['right', 'bottom'] : ['left', 'right', 'top']}
      containerAriaLabel="Уведомления"
      toastOptions={{
        style: {
          background: 'var(--bg-sheet)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)',
          fontFamily: 'var(--font)',
          fontSize: 14,
          borderRadius: 12,
        },
      }}
    />,
    document.body,
  );
}
