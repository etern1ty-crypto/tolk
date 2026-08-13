import { Users, UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import { formatLastSeen } from '../profile/PeerProfile';
import styles from './OnlineFriendsWidget.module.css';

export function OnlineFriendsWidget() {
  const friends = useAppStore((s) => s.friends);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const friendRequestsIn = useAppStore((s) => s.friendRequestsIn);

  const onlineFriends = useMemo(
    () =>
      [...friends]
        .filter((f) => f.online)
        .sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0)),
    [friends],
  );

  const offlineFriends = useMemo(
    () =>
      [...friends]
        .filter((f) => !f.online)
        .sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0))
        .slice(0, 8),
    [friends],
  );

  if (friends.length === 0 && friendRequestsIn.length === 0) return null;

  return (
    <aside className={styles.root} aria-label="Друзья в сети">
      {friendRequestsIn.length > 0 && (
        <div className={styles.requestsBadge}>
          <UserPlus size={14} strokeWidth={iconProps.strokeWidth} />
          <span>{friendRequestsIn.length} заявок</span>
        </div>
      )}

      <header className={styles.header}>
        <Users size={15} strokeWidth={iconProps.strokeWidth} className={styles.icon} />
        <h2>Друзья</h2>
        <span className={styles.count}>{onlineFriends.length} в сети</span>
      </header>

      {onlineFriends.length > 0 && (
        <div className={styles.list}>
          {onlineFriends.map((f) => (
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
