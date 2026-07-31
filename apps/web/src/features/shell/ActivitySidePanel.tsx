import { Bell, Circle, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './ActivitySidePanel.module.css';

export function ActivitySidePanel() {
  const users = useAppStore((s) => s.users);
  const openUserProfile = useAppStore((s) => s.openUserProfile);

  const onlineFriends = Object.values(users).filter((u) => u.online).slice(0, 5);

  return (
    <aside className={styles.root} aria-label="Активность и Уведомления">
      <header className={styles.header}>
        <h2>Активность</h2>
        <p className={styles.sub}>События и популярное</p>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Bell size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          <span>Уведомления</span>
        </div>
        <div className={styles.cardList}>
          <div className={styles.activityItem}>
            <div className={styles.pulseDot} />
            <div className={styles.activityText}>
              <strong>Толк 2.0</strong> обновлен: запущен концепт Unbounded
              <span className={styles.time}>только что</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <UserCheck size={16} className={styles.iconAccent} />
            <div className={styles.activityText}>
              Пользователи в сети и готовы к общению
              <span className={styles.time}>5 мин</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Circle size={10} strokeWidth={2.5} className={styles.outlineDot} />
          <span>В сети сейчас</span>
        </div>
        <div className={styles.friendList}>
          {onlineFriends.length > 0 ? (
            onlineFriends.map((u) => (
              <button
                key={u.id}
                type="button"
                className={styles.friendItem}
                onClick={() => openUserProfile(u.id)}
              >
                <Avatar
                  name={u.displayName}
                  id={u.id}
                  avatarUrl={u.avatarRef}
                  size={32}
                  online={u.online}
                />
                <div className={styles.friendInfo}>
                  <div className={styles.friendName}>{u.displayName}</div>
                  <div className={styles.friendStatus}>в сети</div>
                </div>
              </button>
            ))
          ) : (
            <div className={styles.empty}>Все друзья были недавно</div>
          )}
        </div>
      </div>
    </aside>
  );
}
