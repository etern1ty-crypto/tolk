import { Bell } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './EchoChip.module.css';

export function EchoChip() {
  const echoes = useAppStore((s) => s.echoes);
  const openEchoSheet = useAppStore((s) => s.openEchoSheet);
  const pending = echoes.filter((e) => e.status === 'pending').length;

  if (pending === 0) return null;

  return (
    <button
      type="button"
      className={styles.chip}
      onClick={openEchoSheet}
      aria-label={`Echo, ${pending}`}
    >
      <Bell size={15} strokeWidth={2.4} />
      Echo ×{pending}
    </button>
  );
}
