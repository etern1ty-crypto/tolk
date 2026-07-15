import { useEffect } from 'react';
import { ChatList } from '../chat-list/ChatList';
import { ChatPanel } from '../chat/ChatPanel';
import { WallFeed } from '../wall/WallFeed';
import { ProfileTab } from '../profile/ProfileTab';
import { SearchTab } from '../search/SearchTab';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import styles from './MainShell.module.css';

export function MainShell() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const isDesktop = useIsDesktop();
  const inChatMobile = !isDesktop && mainTab === 'chats' && !!activeChatId;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setMainTab('search');
        window.requestAnimationFrame(() => {
          document.getElementById('tolk-global-search')?.focus();
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMainTab]);

  return (
    <div className={styles.root} data-chat-open={inChatMobile || undefined}>
      <SideNav />

      <div className={styles.workspace}>
        {mainTab === 'wall' && (
          <div className={styles.pageCol}>
            <div className={styles.paper}>
              <WallFeed />
            </div>
          </div>
        )}

        {mainTab === 'chats' && (
          <div className={styles.chatsLayout}>
            {(isDesktop || !activeChatId) && (
              <div className={styles.listCol}>
                <ChatList />
              </div>
            )}
            {(isDesktop || activeChatId) && (
              <div className={styles.chatCol}>
                <ChatPanel />
              </div>
            )}
          </div>
        )}

        {mainTab === 'search' && (
          <div className={styles.pageCol}>
            <div className={styles.paper}>
              <SearchTab />
            </div>
          </div>
        )}

        {mainTab === 'profile' && (
          <div className={styles.pageCol}>
            <div className={`${styles.paper} ${styles.paperProfile}`}>
              <ProfileTab />
            </div>
          </div>
        )}
      </div>

      {!inChatMobile && <BottomNav />}
    </div>
  );
}
