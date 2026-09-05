import { AdminPanel } from '../admin/AdminPanel';
import { useEffect } from 'react';
import { ChatList } from '../chat-list/ChatList';
import { ChatPanel } from '../chat/ChatPanel';
import { WallFeed } from '../wall/WallFeed';
import { OnlineFriendsWidget } from '../wall/OnlineFriendsWidget';
import { ProfileTab } from '../profile/ProfileTab';
import { SearchTab } from '../search/SearchTab';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { ActivitySidePanel } from './ActivitySidePanel';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import styles from './MainShell.module.css';

/**
 * - Mobile: 3-tab bar (Чаты · Стена · Профиль), hidden in open chat
 * - Desktop: thin SideNav rail + list | chat | optional wall column
 */
export function MainShell() {
  const mainTab = useAppStore((s) => s.mainTab);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const shelfOpen = useAppStore((s) => s.shelfOpen);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const isDesktop = useIsDesktop();
  const inChatMobile = !isDesktop && mainTab === 'chats' && !!activeChatId;
  const wallHost = isDesktop && mainTab === 'chats' && !!activeChatId;
  const showWallCol = wallHost && shelfOpen;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      if (e.key === '/' && !typing) {
        e.preventDefault();
        window.dispatchEvent(new Event('tolk:command-menu'));
        return;
      }

      if (
        e.key === 'Escape' &&
        !e.defaultPrevented &&
        !document.querySelector('[role="dialog"], [role="menu"]')
      ) {
        if (shelfOpen) {
          setShelfOpen(false);
          return;
        }
        if (mainTab !== 'chats') {
          setMainTab('chats');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMainTab, setShelfOpen, shelfOpen, mainTab]);

  return (
    <div
      className={styles.root}
      data-chat-open={inChatMobile || undefined}
      data-wall-col={showWallCol || undefined}
    >
      {isDesktop && <SideNav />}

      <div className={styles.workspace}>
        {/* Wall feed pane — persistently mounted for 0ms instant tab switching & preserved scroll */}
        <div
          className={styles.pageCol}
          style={{ flexDirection: 'row', display: mainTab === 'wall' ? 'flex' : 'none' }}
          aria-hidden={mainTab !== 'wall' ? 'true' : undefined}
        >
          {isDesktop && <OnlineFriendsWidget />}
          <div className={styles.paper}>
            <WallFeed />
          </div>
          {isDesktop && <ActivitySidePanel />}
        </div>

        {/* Chats layout pane — persistently mounted */}
        <div
          className={styles.chatsLayout}
          style={{ display: mainTab === 'chats' ? 'flex' : 'none' }}
          aria-hidden={mainTab !== 'chats' ? 'true' : undefined}
        >
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
          {wallHost && (
            <div
              className={styles.wallCol}
              id="tolk-wall-col"
              data-open={showWallCol || undefined}
              hidden={!showWallCol}
            />
          )}
        </div>

        {mainTab === 'search' && (
          <div className={styles.pageCol}>
            <div className={styles.paper}>
              {!isDesktop && (
                <div className={styles.mobilePageBar}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setMainTab('chats')}
                  >
                    ← Чаты
                  </button>
                </div>
              )}
              <SearchTab />
            </div>
          </div>
        )}

        {/* Profile pane — persistently mounted */}
        <div
          className={styles.pageCol}
          style={{ display: mainTab === 'profile' ? 'flex' : 'none' }}
          aria-hidden={mainTab !== 'profile' ? 'true' : undefined}
        >
          <div className={`${styles.paper} ${styles.paperProfile}`}>
            <ProfileTab />
          </div>
        </div>

        {mainTab === 'admin' && (
          <div className={styles.pageCol}>
            <div className={styles.paper}>
              <AdminPanel />
            </div>
          </div>
        )}
      </div>

      {/* Mobile chrome — hide inside open chat for full canvas */}
      {!isDesktop && !inChatMobile && <BottomNav />}
    </div>
  );
}
