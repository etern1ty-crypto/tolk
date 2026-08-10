import { MessageCircle, Newspaper, UserRound, Search, Pin, PenSquare, Settings, Bell, Shield, Palette, LogOut, ChevronRight, Heart, Repeat2, Forward, Link2, MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Onboarding.module.css';

const TABS = [
  { id: 'chats', label: 'Чаты', Icon: MessageCircle },
  { id: 'wall', label: 'Стена', Icon: Newspaper },
  { id: 'profile', label: 'Профиль', Icon: UserRound },
] as const;

type TabId = (typeof TABS)[number]['id'];

const HINTS: Record<TabId, { title: string; desc: string }> = {
  chats: {
    title: 'Ваши диалоги',
    desc: 'Поиск, закреп, архив. Нажмите на чат, чтобы открыть переписку. Кнопка ✏️ — новый разговор.',
  },
  wall: {
    title: 'Стена',
    desc: 'Свайпайте влево для историй. Делитесь моментами без подписчиков, лайков и алгоритмов.',
  },
  profile: {
    title: 'Профиль',
    desc: 'Тема, уведомления, приватность, экспорт данных. Всё под вашим контролем.',
  },
};

/* ── Wall preview with swipeable posts ── */
const WALL_POSTS = [
  { id: 1, author: 'Анна', initial: 'А', color: '#ff3c78', time: '2 ч', text: 'Сегодня пробежал 10 км по набережной! 🏃‍♂️ Кто со мной завтра утром?' },
  { id: 2, author: 'Дмитрий', initial: 'Д', color: '#8b5cf6', time: '5 ч', text: 'Фотки с поездки в Грузию 🇬🇪 Горы, вино, хинкали — идеально.' },
  { id: 3, author: 'Мария', initial: 'М', color: '#f59e0b', time: '8 ч', text: 'Новый рецепт пасты 🍝 Делюсь в комментариях!' },
];

function SwipeablePost({
  post, style, onPointerDown, onPointerMove, onPointerUp, onDismissRef,
}: {
  post: typeof WALL_POSTS[number];
  style: React.CSSProperties;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onDismissRef: React.MutableRefObject<(() => void) | null>;
}) {
  const [dismissed, setDismissed] = useState(false);
  onDismissRef.current = () => setDismissed(true);

  if (dismissed) return null;

  return (
    <article
      className={styles.wallCard}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <header className={styles.wallCardHead}>
        <div className={styles.wallAvatar} style={{ background: post.color }}>{post.initial}</div>
        <div className={styles.wallMeta}>
          <div className={styles.wallName}>{post.author}</div>
          <div className={styles.wallTime}>{post.time}</div>
        </div>
      </header>
      <p className={styles.wallText}>{post.text}</p>
      <footer className={styles.wallActions}>
        <button type="button" className={styles.wallActionBtn}><Heart size={15} strokeWidth={1.8} /></button>
        <button type="button" className={styles.wallActionBtn}><MessageCircle size={15} strokeWidth={1.8} /></button>
        <button type="button" className={styles.wallActionBtn}><Repeat2 size={15} strokeWidth={1.8} /></button>
        <button type="button" className={styles.wallActionBtn}><Forward size={15} strokeWidth={1.8} /></button>
        <button type="button" className={styles.wallActionBtn} style={{ marginLeft: 'auto' }}><Link2 size={15} strokeWidth={1.8} /></button>
      </footer>
    </article>
  );
}

function WallPostCard({ post, swipedIds }: { post: typeof WALL_POSTS[number]; swipedIds: Set<number> }) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState(false);
  const startX = useRef(0);
  const isSwiped = swipedIds.has(post.id);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isSwiped) return;
    setIsDragging(true);
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isSwiped]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || isSwiped) return;
    setDragX(e.clientX - startX.current);
  }, [isDragging, isSwiped]);

  const onDismiss = useRef<(() => void) | null>(null);

  const handlePointerUp = useCallback(() => {
    if (!isDragging || isSwiped) return;
    setIsDragging(false);
    if (Math.abs(dragX) > 60) {
      setExiting(true);
      setTimeout(() => onDismiss.current?.(), 300);
    } else {
      setDragX(0);
    }
  }, [isDragging, isSwiped, dragX]);

  const style: React.CSSProperties = exiting || isSwiped
    ? { transform: `translateX(${dragX > 0 || isSwiped ? -120 : 120}%)`, opacity: 0, transition: 'transform 0.3s ease, opacity 0.3s ease' }
    : isDragging
      ? { transform: `translateX(${dragX}px)`, transition: 'none' }
      : { transform: 'translateX(0)', transition: 'transform 0.3s ease' };

  return (
    <SwipeablePost
      post={post}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDismissRef={onDismiss}
    />
  );
}

function WallPreview() {
  const [swipedIds, setSwipedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setSwipedIds(new Set([1]));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.wallList}>
      {WALL_POSTS.map((post) => (
        <WallPostCard key={post.id} post={post} swipedIds={swipedIds} />
      ))}
    </div>
  );
}

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('chats');
  const hint = HINTS[activeTab];

  const order: TabId[] = ['chats', 'wall', 'profile'];
  const currentIndex = order.indexOf(activeTab);

  const handleNext = () => {
    if (currentIndex < order.length - 1) {
      setActiveTab(order[currentIndex + 1]!);
    } else {
      onComplete();
    }
  };

  return (
    <div className={styles.root}>
      {/* Main 2-column showcase */}
      <div className={styles.showcase}>
        {/* ── Left Column: Phone Frame ── */}
        <div className={styles.phone}>
          {/* Status bar */}
          <div className={styles.statusBar}>
            <span className={styles.statusTime}>12:34</span>
            <MoreHorizontal size={16} className={styles.statusMore} />
          </div>

          {/* Phone Header */}
          <div className={styles.phoneHeader}>
            {activeTab === 'chats' && (
              <>
                <div className={styles.phoneHeaderTitle}>Толк.</div>
                <div className={styles.phoneHeaderActions}>
                  <button type="button" className={styles.headerIconBtn} aria-label="Поиск"><Search size={18} /></button>
                  <button type="button" className={styles.headerIconBtn} aria-label="Новый чат"><PenSquare size={18} /></button>
                </div>
              </>
            )}
            {activeTab === 'wall' && (
              <div className={styles.phoneHeaderTitle}>Стена</div>
            )}
            {activeTab === 'profile' && (
              <div className={styles.phoneHeaderTitle}>Профиль</div>
            )}
          </div>

          {/* Screen Content */}
          <div className={styles.screenContent} key={activeTab}>
            {activeTab === 'chats' && (
              <div className={styles.chatList}>
                {[
                  { name: 'Анна', last: 'Привет! Как дела? 👋', time: '12:30', avatar: '#633cff', unread: 2 },
                  { name: 'Дмитрий', last: 'Скинул фотки с поездки', time: '11:45', avatar: '#ff3c78', unread: 0 },
                  { name: 'Команда Толк', last: 'Добро пожаловать! 🎉', time: '10:00', avatar: '#00d4aa', unread: 1, pinned: true },
                  { name: 'Мария', last: 'Увидимся завтра?', time: 'Вчера', avatar: '#f59e0b', unread: 0 },
                  { name: 'Алексей', last: 'Ок, договорились', time: 'Вчера', avatar: '#8b5cf6', unread: 0 },
                ].map((chat, i) => (
                  <div key={i} className={styles.chatRow}>
                    <div className={styles.chatAvatar} style={{ background: chat.avatar }}>
                      {chat.name[0]}
                    </div>
                    <div className={styles.chatBody}>
                      <div className={styles.chatTopRow}>
                        <span className={styles.chatName}>
                          {chat.pinned && <Pin size={10} className={styles.pinIcon} />}
                          {chat.name}
                        </span>
                        <span className={styles.chatTime}>{chat.time}</span>
                      </div>
                      <div className={styles.chatPreview}>{chat.last}</div>
                    </div>
                    {chat.unread > 0 && (
                      <div className={styles.unreadBadge}>{chat.unread}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wall' && (
              <WallPreview />
            )}

            {activeTab === 'profile' && (
              <div className={styles.profileScreen}>
                <div className={styles.profileHero}>
                  <div className={styles.profileAvatarLg}>Я</div>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileDisplayName}>Мой профиль</div>
                    <div className={styles.profileUsername}>@my_username</div>
                  </div>
                </div>
                <div className={styles.settingsGroup}>
                  {[
                    { icon: Palette, label: 'Тема оформления' },
                    { icon: Bell, label: 'Уведомления' },
                    { icon: Shield, label: 'Приватность' },
                    { icon: Settings, label: 'Данные и хранилище' },
                    { icon: LogOut, label: 'Выйти', danger: true },
                  ].map((item, i) => (
                    <div key={i} className={`${styles.settingRow}${item.danger ? ` ${styles.settingDanger}` : ''}`}>
                      <div className={styles.settingLeft}>
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={styles.settingChevron} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <nav className={styles.bottomNav}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={active ? styles.navActive : styles.navTab}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.navIconWrap}>
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  <span className={styles.navLabel}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Right Column: Text & Description ── */}
        <div className={styles.textSide} key={activeTab}>
          <h1 className={styles.sideTitle}>{hint.title}</h1>
          <p className={styles.sideDesc}>{hint.desc}</p>
        </div>
      </div>

      {/* ── Bottom Controls ── */}
      <div className={styles.bottomControls}>
        <div className={styles.dots}>
          {order.map((t, idx) => (
            <button
              key={t}
              type="button"
              aria-label={`Шаг ${idx + 1}`}
              className={`${styles.dot}${activeTab === t ? ` ${styles.dotActive}` : ''}`}
              onClick={() => setActiveTab(t)}
            />
          ))}
        </div>

        <button type="button" className={styles.startBtn} onClick={handleNext}>
          {currentIndex === order.length - 1 ? 'Понятно, начать' : 'Далее'}
        </button>

        <button type="button" className={styles.skipBtn} onClick={onComplete}>
          Пропустить
        </button>
      </div>
    </div>
  );
}
