import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './OnlineFriendsWidget.module.css';

export function OnlineFriendsWidget() {
  const friends = useAppStore((s) => s.friends);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const onlineFriends = useMemo(
    () =>
      [...friends]
        .filter((f) => f.online)
        .sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0))
        .slice(0, 8),
    [friends],
  );
  if (!onlineFriends.length) return null;
  return (
    <aside className={styles.root} aria-label="Друзья в сети">
      <div className={styles.dock}>
        {onlineFriends.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.bubble}
            onClick={() => void openUserProfile(f.id)}
            aria-label={`${f.displayName}, в сети`}
          >
            <Avatar name={f.displayName} id={f.id} avatarUrl={f.avatarRef} size={40} online />
            <span className={styles.tooltip} aria-hidden="true">
              {f.displayName}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
