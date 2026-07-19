import { MessageCircle, Newspaper, Search } from 'lucide-react';
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
  { id: 'chats', label: 'Чаты', Icon: MessageCircle },
  { id: 'wall', label: 'Стена', Icon: Newspaper },
  { id: 'search', label: 'Поиск', Icon: Search },
];

/** Desktop-only thin icon rail — not a TG folder tree */
export function SideNav() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const me = useAppStore((s) => s.me);
  const chats = useAppStore((s) => s.chats);
  const posts = useAppStore((s) => s.posts);
  const wallSeenAt = useAppStore((s) => s.wallSeenAt);
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
        title="Толк · чаты"
        aria-label="Толк — к чатам"
      >
        <span className={styles.logo}>Т</span>
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
              aria-label={tab.label}
              title={tab.label}
            >
              <Icon size={iconProps.size.lg} strokeWidth={iconProps.strokeWidth} />
              {n > 0 && <span className={styles.badge}>{n > 9 ? '9+' : n}</span>}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className={mainTab === 'profile' ? styles.userActive : styles.user}
        onClick={() => setMainTab('profile')}
        onContextMenu={(e) => {
          e.preventDefault();
          openSettings();
        }}
        title="Профиль · ПКМ — настройки"
        aria-label="Профиль"
        aria-current={mainTab === 'profile' ? 'page' : undefined}
      >
        <Avatar
          name={me.displayName}
          id={me.id}
          avatarUrl={me.avatarRef}
          size={32}
          online={me.online}
        />
      </button>
    </aside>
  );
}
