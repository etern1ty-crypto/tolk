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
import { useAppStore } from './store/appStore';
import { AMBIENT_PATTERN } from './shared/patterns';
import { PatternBg } from './shared/ui/PatternBg';
import { useEffect } from 'react';
import styles from './App.module.css';

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    useAppStore.getState().initApi();
  }, []);

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
