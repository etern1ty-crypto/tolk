import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import styles from './PeerProfile.module.css';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
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
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.panel}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 40, opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <div className={styles.banner} style={{ background: user.banner }}>
          <div className={styles.bannerOverlay} />
          <IconBtn
            className={styles.close}
            onClick={closeUserProfile}
            aria-label="Назад"
          >
            <ArrowLeft size={18} />
          </IconBtn>
        </div>
        <div className={styles.avatarWrap}>
          <Avatar name={user.displayName} size={84} online={user.online} />
        </div>
        <div className={styles.body}>
          <h1>{user.displayName}</h1>
          <p className={styles.uname}>@{user.username}</p>
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
              <MessageCircle size={17} />
              Написать
            </button>
          )}
          <h2>Посты</h2>
          {list.length === 0 ? (
            <p className={styles.empty}>Пока тихо.</p>
          ) : (
            list.map((p) => (
              <article key={p.id} className={styles.post}>
                <time>{rel(p.createdAt)}</time>
                {p.media && (
                  <div
                    className={styles.media}
                    style={{ background: p.media.src }}
                  />
                )}
                {p.text ? <p>{p.text}</p> : null}
              </article>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
