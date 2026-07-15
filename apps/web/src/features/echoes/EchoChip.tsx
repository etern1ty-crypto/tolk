import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './EchoChip.module.css';

export function EchoChip() {
  const echoes = useAppStore((s) => s.echoes);
  const openEchoSheet = useAppStore((s) => s.openEchoSheet);
  const pending = echoes.filter((e) => e.status === 'pending').length;

  if (pending === 0) return null;

  return (
    <motion.button
      type="button"
      className={styles.chip}
      onClick={openEchoSheet}
      aria-label={`Echo, ${pending}`}
      initial={{ y: -16, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Bell size={15} strokeWidth={2.4} />
      Echo ×{pending}
    </motion.button>
  );
}
