import { MessageCircle, Newspaper, Pin, Search, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import type { MainTab } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './SideNav.module.css';

const TABS: {
  id: MainTab;
  label: string;
  Icon: typeof Newspaper;
}[] = [
  { id: 'wall', label: 'Стена', Icon: Newspaper },
  { id: 'chats', label: 'Чаты', Icon: MessageCircle },
  { id: 'search', label: 'Поиск', Icon: Search },
  { id: 'profile', label: 'Профиль', Icon: UserRound },
];

export function SideNav() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const me = useAppStore((s) => s.me);
  const chats = useAppStore((s) => s.chats);
  const posts = useAppStore((s) => s.posts);
  const wallSeenAt = useAppStore((s) => s.wallSeenAt);
  const navPins = useAppStore((s) => s.navPins);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const toggleNavPin = useAppStore((s) => s.toggleNavPin);
  const openSettings = useAppStore((s) => s.openSettings);

  const unreadChats = useMemo(
    () => chats.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0),
    [chats]
  );
  const wallNew = useMemo(
    () =>
      posts.filter(
        (p) => p.onWall && p.authorId !== me.id && p.createdAt > wallSeenAt
      ).length,
    [posts, wallSeenAt, me.id]
  );

  const pinnedChats = useMemo(() => {
    const byId = new Map(chats.map((c) => [c.id, c]));
    return navPins.map((id) => byId.get(id)).filter(Boolean) as typeof chats;
  }, [chats, navPins]);

  const badge = (tab: MainTab) => {
    if (tab === 'chats') return unreadChats;
    if (tab === 'wall') return wallNew;
    return 0;
  };

  return (
    <aside className={styles.root} aria-label="Навигация">
      <button
        type="button"
        className={styles.brand}
        onClick={() => setMainTab('chats')}
        title="Перейти к чатам"
      >
        <span className={styles.logo}>Т</span>
        <span className={styles.brandName}>Толк.</span>
      </button>

      <nav className={styles.nav}>
        {TABS.map((tab) => {
          const active = mainTab === tab.id;
          const n = badge(tab.id);
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={active ? styles.itemActive : styles.item}
              onClick={() => setMainTab(tab.id)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={iconProps.size.lg} strokeWidth={iconProps.strokeWidth} />
              <span className={styles.itemLabel}>{tab.label}</span>
              {n > 0 && <span className={styles.badge}>{n > 9 ? '9+' : n}</span>}
            </button>
          );
        })}

        {/* Quick pins under main tabs — jump into chat while browsing feed */}
        <div className={styles.pins}>
          <div className={styles.pinsLabel}>
            <Pin size={12} strokeWidth={iconProps.strokeWidth} />
            Закрепы
          </div>
          {pinnedChats.length === 0 ? (
            <p className={styles.pinsEmpty}>
              ПКМ по чату — закрепить
            </p>
          ) : (
            pinnedChats.map((chat) => {
              const active = activeChatId === chat.id && mainTab === 'chats';
              return (
                <button
                  key={chat.id}
                  type="button"
                  className={active ? styles.pinActive : styles.pin}
                  onClick={() => setActiveChat(chat.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleNavPin(chat.id);
                  }}
                  title={`${chat.title} · ПКМ — открепить`}
                >
                  <Avatar name={chat.title} size={28} online={chat.online} />
                  <span className={styles.pinTitle}>{chat.title}</span>
                  {chat.unread > 0 && (
                    <span className={styles.pinBadge}>
                      {chat.unread > 9 ? '9+' : chat.unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </nav>

      <button
        type="button"
        className={styles.user}
        onClick={() => {
          setMainTab('profile');
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          openSettings();
        }}
        title="Профиль · ПКМ — настройки"
      >
        <Avatar name={me.displayName} size={36} online={me.online} />
        <div className={styles.userMeta}>
          <span className={styles.userName}>{me.displayName}</span>
          <span className={styles.userHandle}>@{me.username}</span>
        </div>
      </button>
    </aside>
  );
}
