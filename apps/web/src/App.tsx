import { AuthScreen } from './features/auth/AuthScreen';
import { EchoChip } from './features/echoes/EchoChip';
import { EchoSheet } from './features/echoes/EchoSheet';
import { AttachSheet } from './features/chat/AttachSheet';
import { CircleSheet } from './features/chat/CircleSheet';
import { MessageContextMenu } from './features/chat/MessageContextMenu';
import { NewChatSheet } from './features/chat/NewChatSheet';
import { ReactionPicker } from './features/chat/ReactionPicker';
import { ShelfSheet } from './features/chat/ShelfSheet';
import { PeerProfile } from './features/profile/PeerProfile';
import { SettingsOverlay } from './features/settings/SettingsOverlay';
import { CommentSheet } from './features/wall/CommentSheet';
import { ForwardSheet } from './features/wall/ForwardSheet';
import { MainShell } from './features/shell/MainShell';
import { OfflineBanner } from './features/shell/OfflineBanner';
import { Toast } from './features/shell/Toast';
import { fetchApi, useAppStore } from './store/appStore';
import { AMBIENT_PATTERN } from './shared/patterns';
import { PatternBg } from './shared/ui/PatternBg';
import { useEffect } from 'react';
import styles from './App.module.css';

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    useAppStore.getState().initApi();
  }, []);

  // Deep links: /?chat= · /?user= · /?post= · /s/:slug handled via path
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chat = params.get('chat');
    const user = params.get('user');
    const post = params.get('post');
    const run = async () => {
      const store = useAppStore.getState();
      if (!store.isAuthenticated) return;
      if (chat) {
        await store.setActiveChat(chat);
      } else if (user) {
        await store.openUserProfile(user);
      } else if (post) {
        store.setMainTab('wall');
        store.setCommentPostId(post);
      }
      // /s/slug share resolve
      const path = window.location.pathname;
      const m = path.match(/^\/s\/([a-zA-Z0-9_-]+)$/);
      if (m?.[1] && store.token) {
        try {
          const link = await fetchApi(
            `/share-links/${m[1]}`,
            {},
            store.token
          );
          if (link.kind === 'user') await store.openUserProfile(link.targetId);
          else if (link.kind === 'post') {
            store.setMainTab('wall');
            store.setCommentPostId(link.targetId);
          } else if (link.kind === 'group' || link.kind === 'channel') {
            await store.setActiveChat(link.targetId);
          }
        } catch (e) {
          console.warn('share link resolve failed', e);
        }
      }
    };
    void run();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.app}>
        <div className={styles.ambient} aria-hidden>
          <PatternBg pattern={AMBIENT_PATTERN} seed="tolk-auth" density="high" />
        </div>
        <div className={styles.authLayer}>
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.ambient} aria-hidden>
        <PatternBg pattern={AMBIENT_PATTERN} seed="tolk-ambient" density="high" />
      </div>
      <OfflineBanner />
      <div className={styles.main}>
        <div className={styles.shell}>
          <MainShell />
        </div>
      </div>
      <EchoChip />
      <EchoSheet />
      <AttachSheet />
      <CircleSheet />
      <NewChatSheet />
      <MessageContextMenu />
      <ReactionPicker />
      <ShelfSheet />
      <CommentSheet />
      <ForwardSheet />
      <SettingsOverlay />
      <PeerProfile />
      <Toast />
    </div>
  );
}
