import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { BANNER_PATTERNS, MEDIA_PATTERNS, patternById, generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './PeerProfile.module.css';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

export function formatLastSeen(ts?: number) {
  if (!ts) return 'был(а) недавно';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `был(а) сегодня в ${time}`;
  return `был(а) ${d.toLocaleDateString()} в ${time}`;
}

export function PeerProfile() {
  const userId = useAppStore((s) => s.viewingUserId);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const posts = useAppStore((s) => s.posts);
  const closeUserProfile = useAppStore((s) => s.closeUserProfile);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  const setMainTab = useAppStore((s) => s.setMainTab);

  const user = userId ? users[userId] : null;
  const isSelf = user?.id === me.id;
  const banner = user
    ? patternById(BANNER_PATTERNS, user.bannerPatternId)
    : BANNER_PATTERNS[0]!;

  const list = useMemo(
    () =>
      posts
        .filter((p) => p.authorId === userId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, userId]
  );

  if (!userId || !user) return null;

  return (
    <motion.div
      className={styles.overlay}
      onClick={closeUserProfile}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={styles.panel}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 40, opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <div className={styles.banner}>
          <PatternBg
            pattern={banner}
            seed={user.id}
            density="high"
            className={styles.bannerFill}
          />
          <IconBtn className={styles.close} onClick={closeUserProfile} aria-label="Назад">
            <ArrowLeft size={18} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
        </div>
        <div className={styles.avatarWrap}>
          <Avatar name={user.displayName} id={user.id} avatarUrl={user.avatarRef} size={84} online={user.online} />
        </div>
        <div className={styles.body}>
          <h1>{user.displayName}</h1>
          {user.username?.trim() ? (
            <p className={styles.uname}>@{user.username}</p>
          ) : (
            <p className={styles.uname} style={{ opacity: 0.55 }}>без username</p>
          )}
          {user.online ? (
            <p className={styles.online}>в сети</p>
          ) : (
            <p className={styles.lastSeen}>{formatLastSeen(user.lastSeenAt)}</p>
          )}
          <p className={styles.bio}>{user.bio || '—'}</p>
          {isSelf ? (
            <button
              type="button"
              className={styles.cta}
              onClick={() => {
                closeUserProfile();
                setMainTab('profile');
              }}
            >
              Мой профиль
            </button>
          ) : (
            <button
              type="button"
              className={styles.cta}
              onClick={() => startChatWithUser(user.id)}
            >
              <MessageCircle size={17} strokeWidth={iconProps.strokeWidth} />
              Написать
            </button>
          )}
          <h2>Посты</h2>
          {list.length === 0 ? (
            <p className={styles.empty}>Пока тихо.</p>
          ) : (
            list.map((p) => {
              const mediaPat =
                p.media?.kind === 'pattern'
                  ? p.media.patternId === 'custom' && p.media.items
                    ? generateCustomPattern(p.media.items.join(' '), p.id)
                    : patternById(MEDIA_PATTERNS, p.media.patternId, MEDIA_PATTERNS[0]!)
                  : null;
              return (
                <article key={p.id} className={styles.post}>
                  <time>{rel(p.createdAt)}</time>
                  {mediaPat && (
                    <div className={styles.media} style={p.media?.height ? { height: `${p.media.height}px` } : undefined}>
                      <PatternBg
                        pattern={mediaPat}
                        seed={p.id}
                        density="mid"
                        className={styles.mediaFill}
                      />
                    </div>
                  )}
                  {p.media?.kind === 'image' && p.media?.url && (
                    <div className={styles.media} style={p.media.height ? { height: `${p.media.height}px` } : undefined}>
                      <img src={p.media.url} alt={p.media?.alt ?? 'медиа'} className={styles.mediaFill} style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  {p.text ? (
                    <p 
                      style={{
                        fontSize: p.media?.fontSize ? `${p.media.fontSize}px` : undefined,
                        fontFamily: p.media?.fontFamily === 'serif' ? 'serif' : p.media?.fontFamily === 'mono' ? 'monospace' : undefined,
                        lineHeight: 1.45
                      }}
                    >
                      {p.text}
                    </p>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
