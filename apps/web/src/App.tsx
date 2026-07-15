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
import styles from './App.module.css';

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className={styles.app}>
      <OfflineBanner />
      <div className={styles.main}>
        <MainShell />
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
