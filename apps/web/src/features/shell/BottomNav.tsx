import { MessageCircle, Newspaper, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import type { MainTab } from '../../shared/types';
import { iconProps } from '../../shared/ui/icons';
import { SlidingTabs } from '../../shared/ui/SlidingTabs';
import styles from './BottomNav.module.css';

/** Mobile-only: 3 tabs (not TG chrome). Hidden while a chat is open. */
const TABS: {
  id: MainTab;
  label: string;
  Icon: typeof Newspaper;
}[] = [
  { id: 'chats', label: 'Чаты', Icon: MessageCircle },
  { id: 'wall', label: 'Стена', Icon: Newspaper },
  { id: 'profile', label: 'Профиль', Icon: UserRound },
];

export function BottomNav() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const chats = useAppStore((s) => s.chats);
  const posts = useAppStore((s) => s.posts);
  const wallSeenAt = useAppStore((s) => s.wallSeenAt);
  const me = useAppStore((s) => s.me);

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
    if (tab === 'chats' && unreadChats > 0) return unreadChats;
    if (tab === 'wall' && wallNew > 0) return wallNew;
    return 0;
  };

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <SlidingTabs
        className={styles.mobileTabs}
        tabs={TABS.map((tab) => ({
          id: tab.id,
          label: tab.label,
          badge: badge(tab.id) > 0 ? (badge(tab.id) > 9 ? '9+' : badge(tab.id)) : undefined,
          icon: <tab.Icon size={iconProps.size.lg} strokeWidth={iconProps.strokeWidth} />,
        }))}
        activeId={mainTab as MainTab}
        onChange={(id) => setMainTab(id as MainTab)}
      />
    </nav>
  );
}
