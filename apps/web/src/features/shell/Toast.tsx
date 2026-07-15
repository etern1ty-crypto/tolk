import { useAppStore } from '../../store/appStore';
import styles from './Toast.module.css';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className={styles.toast} role="status">
      {toast}
    </div>
  );
}
