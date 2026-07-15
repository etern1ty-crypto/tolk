import { useAppStore } from '../../store/appStore';
import styles from './OfflineBanner.module.css';

export function OfflineBanner() {
  const isOffline = useAppStore((s) => s.isOffline);
  if (!isOffline) return null;
  return (
    <div className={styles.banner} role="status">
      Нет сети · сообщения в outbox (mock)
    </div>
  );
}
