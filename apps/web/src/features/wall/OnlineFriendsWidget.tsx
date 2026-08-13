import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './OnlineFriendsWidget.module.css';

/**
 * Floating avatar-bubbles positioned OUTSIDE the main content area (left gutter).
 * Shows only online friends as glass bubbles with tooltip on hover.
 */
export function OnlineFriendsWidget() {
  const friends = useAppStore((s) => s.friends);
  const openUserProfile = useAppStore((s) => s.openUserProfile);

  const onlineFriends = useMemo(
    () =>
      [...friends]
        .filter((f) => f.online)
        .sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0))
        .slice(0, 6),
    [friends],
  );

  if (onlineFriends.length === 0) return null;

  return (
    <aside className={styles.root} aria-label="Друзья в сети">
      {onlineFriends.map((f) => (
        <button
          key={f.id}
          type="button"
          className={styles.bubble}
          onClick={() => openUserProfile(f.id)}
          aria-label={`${f.displayName}, в сети`}
            >
              <Avatar
                name={f.displayName}
                id={f.id}
                avatarUrl={f.avatarRef}
                size={32}
                online
              />
              <div className={styles.info}>
                <div className={styles.name}>{f.displayName}</div>
                <div className={styles.status}>в сети</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {offlineFriends.length > 0 && (
        <>
          <div className={styles.separator} />
          <div className={styles.offlineLabel}>Не в сети</div>
          <div className={styles.list}>
            {offlineFriends.map((f) => (
              <button
                key={f.id}
                type="button"
                className={styles.item}
                onClick={() => openUserProfile(f.id)}
              >
                <Avatar
                  name={f.displayName}
                  id={f.id}
                  avatarUrl={f.avatarRef}
                  size={32}
                />
                <div className={styles.info}>
                  <div className={styles.name}>{f.displayName}</div>
                  <div className={styles.statusOffline}>
                    {f.lastSeenAt ? formatLastSeen(f.lastSeenAt) : 'был(а) недавно'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
