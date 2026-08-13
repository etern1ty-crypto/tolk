import { Box, MessageCircle, Newspaper, Search, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import type { MainTab } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import { SlidingTabs } from '../../shared/ui/SlidingTabs';
import styles from './SideNav.module.css';

/** Desktop-only thin icon rail — not a TG folder tree */
export function SideNav() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const me = useAppStore((s) => s.me);
  const chats = useAppStore((s) => s.chats);
  const posts = useAppStore((s) => s.posts);
  const wallSeenAt = useAppStore((s) => s.wallSeenAt);
  const openSettings = useAppStore((s) => s.openSettings);

  const isAdmin = me.username === 'nekach' || me.username === 'admin' || me.isAdmin;

  const tabsList = useMemo(() => {
    const list = [
      { id: 'chats' as MainTab, label: 'Чаты', Icon: MessageCircle },
      { id: 'wall' as MainTab, label: 'Стена', Icon: Newspaper },
      { id: 'search' as MainTab, label: 'Поиск', Icon: Search },
    ];
    if (isAdmin) {
      list.push({ id: 'admin' as MainTab, label: 'Админка', Icon: ShieldCheck });
      list.push({ id: 'demo' as MainTab, label: 'Демо', Icon: Box });
    }
    return list;
  }, [isAdmin]);

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
        onClick={() => setMainTab(mainTab === 'wall' ? 'chats' : 'wall')}
        title="Толк. — Переключить стену"
        aria-label="Толк — Переключить стену"
      >
        <div className={styles.logoWrap}>
          <span className={styles.logoDefaultText}>
            <span className={styles.logoLetter}>Т</span>
            <span className={styles.logoDot}>.</span>
          </span>
          <span className={styles.logoExpandedText}>Толк.</span>
        </div>
      </button>

      <nav className={styles.nav}>
        <SlidingTabs
          variant="vertical"
          tabs={tabsList.map((tab) => ({
            id: tab.id,
            label: '',
            badge: badge(tab.id) > 0 ? (badge(tab.id) > 9 ? '9+' : badge(tab.id)) : undefined,
            icon: <tab.Icon size={iconProps.size.lg} strokeWidth={iconProps.strokeWidth} />,
          }))}
          activeId={mainTab as MainTab}
          onChange={(id) => setMainTab(id)}
        />
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
