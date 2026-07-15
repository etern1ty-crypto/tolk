import { useEffect } from 'react';
import { ChatList } from '../chat-list/ChatList';
import { ChatPanel } from '../chat/ChatPanel';
import { WallFeed } from '../wall/WallFeed';
import { ProfileTab } from '../profile/ProfileTab';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import styles from './MainShell.module.css';

export function MainShell() {
  const mainTab = useAppStore((s) => s.mainTab);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        document.getElementById('tolk-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {mainTab === 'wall' && <WallFeed />}

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

        {mainTab === 'profile' && <ProfileTab />}
      </div>
      <BottomNav />
    </div>
  );
}
