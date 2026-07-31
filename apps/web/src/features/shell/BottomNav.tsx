import { MessageCircle, Newspaper, UserRound, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import type { MainTab } from '../../shared/types';
import { iconProps } from '../../shared/ui/icons';
import { SlidingTabs } from '../../shared/ui/SlidingTabs';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const chats = useAppStore((s) => s.chats);
  const posts = useAppStore((s) => s.posts);
  const wallSeenAt = useAppStore((s) => s.wallSeenAt);
  const me = useAppStore((s) => s.me);

  const isAdmin = me.username === 'nekach' || me.username === 'admin' || me.isAdmin;

  const tabsList = useMemo(() => {
    const list = [
      { id: 'chats' as MainTab, label: 'Чаты', Icon: MessageCircle },
      { id: 'wall' as MainTab, label: 'Стена', Icon: Newspaper },
      { id: 'profile' as MainTab, label: 'Профиль', Icon: UserRound },
    ];
    if (isAdmin) {
      list.push({ id: 'admin' as MainTab, label: 'Админ', Icon: ShieldCheck });
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
    if (tab === 'chats' && unreadChats > 0) return unreadChats;
    if (tab === 'wall' && wallNew > 0) return wallNew;
    return 0;
  };

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <SlidingTabs
        className={styles.mobileTabs}
        tabs={tabsList.map((tab) => ({
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
