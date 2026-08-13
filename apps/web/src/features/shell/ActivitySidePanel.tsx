import { Bell, Heart, MessageCircle, Sparkles, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import { formatLastSeen } from '../profile/PeerProfile';
import styles from './ActivitySidePanel.module.css';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

export function ActivitySidePanel() {
  const users = useAppStore((s) => s.users);
  const posts = useAppStore((s) => s.posts);
  const me = useAppStore((s) => s.me);
  const notifications = useAppStore((s) => s.notifications);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const friends = useAppStore((s) => s.friends);

  // Real friends list, sorted: Online first, then by lastSeenAt
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      return (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
    });
  }, [friends]);

  // Dynamic real social activity feed
  const activityList = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.slice(0, 6).map((n: any) => ({
        id: n.id || `${n.type}-${n.postId}-${n.createdAt}`,
        userId: n.userId,
        userName: n.displayName || n.username || 'Пользователь',
        avatarUrl: n.avatarRef,
        actionText:
          n.type === 'like'
            ? 'оценил(а) ваш пост'
            : n.type === 'comment'
            ? `комментарий: ${n.text || '…'}`
            : 'оставил(а) отклик',
        time: rel(n.createdAt || Date.now()),
        kind: n.type === 'like' ? 'heart' : 'comment',
      }));
    }

    const derived: any[] = [];
    for (const post of posts) {
      if (post.likedBy && post.likedBy.length > 0) {
        for (const likerId of post.likedBy) {
          if (likerId !== me.id) {
            const liker = users[likerId];
            derived.push({
              id: `like-${post.id}-${likerId}`,
              userId: likerId,
              userName: liker?.displayName || 'Пользователь',
              avatarUrl: liker?.avatarRef,
              actionText: 'оценил(а) ваш пост',
              time: rel(post.createdAt),
              kind: 'heart',
            });
          }
        }
      }

      for (const comm of post.comments || []) {
        if (comm.userId !== me.id) {
          const commUser = users[comm.userId];
          derived.push({
            id: `comm-${comm.id}`,
            userId: comm.userId,
            userName: commUser?.displayName || commUser?.username || 'Пользователь',
            avatarUrl: commUser?.avatarRef,
            actionText: `комментарий: ${comm.text.slice(0, 28)}${
              comm.text.length > 28 ? '…' : ''
            }`,
            time: rel(comm.createdAt),
            kind: 'comment',
          });
        }
      }
    }

    if (derived.length === 0) {
      derived.push({
        id: 'system-ready',
        userName: 'Толк',
        actionText: 'События и отклики будут отображаться здесь',
        time: 'сейчас',
        kind: 'sparkles',
      });
    }

    return derived.slice(0, 6);
  }, [notifications, posts, users, me.id]);

  return (
    <aside className={styles.root} aria-label="Активность и Уведомления">
      <header className={styles.header}>
        <h2>Активность</h2>
        <p className={styles.sub}>События и уведомления</p>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Bell size={15} strokeWidth={iconProps.strokeWidth} className={styles.sectionIcon} />
          <span>Уведомления</span>
        </div>

        <div className={styles.cardList}>
          {activityList.map((act) => (
            <div
              key={act.id}
              className={styles.activityItem}
              onClick={() => act.userId && openUserProfile(act.userId)}
              style={{ cursor: act.userId ? 'pointer' : 'default' }}
            >
              {act.userId ? (
                <Avatar
                  name={act.userName}
                  id={act.userId}
                  avatarUrl={act.avatarUrl}
                  size={28}
                />
              ) : act.kind === 'heart' ? (
                <Heart size={16} color="#f87171" fill="#f87171" />
              ) : act.kind === 'comment' ? (
                <MessageCircle size={16} className={styles.iconAccent} />
              ) : (
                <Sparkles size={16} className={styles.iconAccent} />
              )}
              <div className={styles.activityText}>
                <strong>{act.userName}</strong> <span>{act.actionText}</span>
              </div>
              <span className={styles.time}>{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Users size={15} strokeWidth={iconProps.strokeWidth} className={styles.sectionIcon} />
          <span>Друзья ({sortedFriends.length})</span>
        </div>
        <div className={styles.friendList}>
          {sortedFriends.length > 0 ? (
            sortedFriends.map((f) => (
              <button
                key={f.id}
                type="button"
                className={styles.friendItem}
                onClick={() => openUserProfile(f.id)}
              >
                <Avatar
                  name={f.displayName}
                  id={f.id}
                  avatarUrl={f.avatarRef}
                  size={32}
                  online={f.online}
                />
                <div className={styles.friendInfo}>
                  <div className={styles.friendName}>{f.displayName}</div>
                  <div className={styles.friendStatus}>
                    {f.online ? (
                      <span className={styles.onlineBadge}>в сети</span>
                    ) : (
                      <span className={styles.offlineText}>
                        {f.lastSeenAt ? formatLastSeen(f.lastSeenAt) : 'был(а) недавно'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className={styles.empty}>Пока нет друзей</div>
          )}
        </div>
      </div>
    </aside>
  );
}
