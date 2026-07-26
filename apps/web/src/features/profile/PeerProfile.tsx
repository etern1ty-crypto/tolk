import { ArrowLeft, Link2, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { copyShareLink } from '../../shared/lib/share';
import { BANNER_PATTERNS, MEDIA_PATTERNS, patternById, generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './PeerProfile.module.css';
import { PostImage } from '../../shared/ui/PostImage';

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
  const blockUser = useAppStore((st) => st.blockUser);
  const unblockUser = useAppStore((st) => st.unblockUser);
  const reportUser = useAppStore((st) => st.reportUser);
  const blockedIds = useAppStore((st) => st.blockedIds);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');

  const userId = useAppStore((s) => s.viewingUserId);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const posts = useAppStore((s) => s.posts);
  const closeUserProfile = useAppStore((s) => s.closeUserProfile);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const token = useAppStore((s) => s.token);
  const showToast = useAppStore((s) => s.showToast);

  const user = userId ? users[userId] : null;
  const isSelf = user?.id === me.id;
  const blocked = !!user && blockedIds.includes(user.id);
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
    <div
      className={styles.overlay}
      onClick={closeUserProfile}
      role="presentation"
    >
      <div
        className={styles.panel}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.banner}>
          {user.bannerRef ? (
            <PostImage src={user.bannerRef} alt="" className={styles.bannerPhoto} fallback={null} />
          ) : (
            <PatternBg
              pattern={banner}
              seed={user.id}
              density="low"
              className={styles.bannerFill}
            />
          )}
          <IconBtn className={styles.close} onClick={closeUserProfile} aria-label="Назад">
            <ArrowLeft size={18} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
          <IconBtn
            className={styles.share}
            aria-label="Поделиться"
            title="Поделиться"
            onClick={async () => {
              try {
                await copyShareLink('user', user.id, token);
                showToast('Ссылка скопирована');
              } catch (e: any) {
                showToast(e.message || 'Ошибка');
              }
            }}
          >
            <Link2 size={18} strokeWidth={iconProps.strokeWidth} />
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
            <>
              <button
                type="button"
                className={styles.cta}
                onClick={() => startChatWithUser(user.id)}
              >
                <MessageCircle size={17} strokeWidth={iconProps.strokeWidth} />
                Написать
              </button>
              {/* Безопасность до сих пор существовала только на сервере: пожаловаться
                  или заблокировать было нечем. Тон приглушённый — это не то, чем
                  пользуются каждый день, но найти нужно сразу. */}
              <div className={styles.safety}>
                <button
                  type="button"
                  onClick={() => (blocked ? unblockUser(user.id) : blockUser(user.id))}
                >
                  {blocked ? 'Разблокировать' : 'Заблокировать'}
                </button>
                <span aria-hidden>·</span>
                <button type="button" onClick={() => setReporting(true)}>
                  Пожаловаться
                </button>
              </div>
              {reporting && (
                <form
                  className={styles.reportBox}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = reason.trim();
                    if (!text) return;
                    reportUser(user.id, text);
                    setReporting(false);
                    setReason('');
                  }}
                >
                  <label htmlFor="report-reason">Что не так?</label>
                  <textarea
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Опишите, что произошло"
                  />
                  <div className={styles.reportActions}>
                    <button type="button" onClick={() => { setReporting(false); setReason(''); }}>
                      Отмена
                    </button>
                    <button type="submit" disabled={!reason.trim()}>
                      Отправить
                    </button>
                  </div>
                </form>
              )}
            </>
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
                      <PostImage src={p.media.url} alt={p.media?.alt ?? 'медиа'} className={styles.mediaFill} style={{ objectFit: 'cover' }} />
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
      </div>
    </div>
  );
}
