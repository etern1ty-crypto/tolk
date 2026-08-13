import { AuthScreen } from './features/auth/AuthScreen';
import { EchoChip } from './features/echoes/EchoChip';
import { EchoSheet } from './features/echoes/EchoSheet';
import { AttachSheet } from './features/chat/AttachSheet';
import { CircleSheet } from './features/chat/CircleSheet';
import { MessageContextMenu } from './features/chat/MessageContextMenu';
import { ChatInfoSheet } from './features/chat/ChatInfoSheet';
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
import { CallOverlay } from './features/call/CallOverlay';
import { fetchApi, useAppStore } from './store/appStore';
import { AMBIENT_PATTERN } from './shared/patterns';
import { PatternBg } from './shared/ui/PatternBg';
import { useEffect } from 'react';
import styles from './App.module.css';

/** Куда вести человека после входа: пережидает регистрацию и вход через соцсеть. */
const PENDING_TARGET_KEY = 'tolk:pending-target';

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    useAppStore.getState().initApi();
  }, []);

  // Диплинки: /?chat= · /?user= · /?post= · /s/:slug
  //
  // Цель запоминается ДО проверки авторизации. Раньше обработчик выходил по
  // return для неавторизованного, и человек, пришедший по ссылке друга, попадал
  // на экран входа, а приглашение молча пропадало — то есть единственный
  // механизм роста не работал ровно для того, ради кого он существует.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = window.location.pathname.match(/^\/s\/([a-zA-Z0-9_-]+)$/)?.[1];
    const target =
      (slug && { kind: 's' as const, id: slug }) ||
      (params.get('chat') && { kind: 'chat' as const, id: params.get('chat')! }) ||
      (params.get('user') && { kind: 'user' as const, id: params.get('user')! }) ||
      (params.get('post') && { kind: 'post' as const, id: params.get('post')! }) ||
      null;

    if (target) {
      try {
        sessionStorage.setItem(PENDING_TARGET_KEY, JSON.stringify(target));
      } catch {
        // приватный режим — переживём, просто цель не сохранится
      }
    }
  }, []);

  // Выполняем отложенную цель, когда пользователь появился.
  useEffect(() => {
    if (!isAuthenticated) return;
    const run = async () => {
      const store = useAppStore.getState();
      let target: { kind: string; id: string } | null = null;
      try {
        const raw = sessionStorage.getItem(PENDING_TARGET_KEY);
        target = raw ? JSON.parse(raw) : null;
      } catch {
        target = null;
      }
      if (!target) return;
      // Снимаем до выполнения: неудачная ссылка не должна срабатывать на каждый
      // повторный вход.
      try {
        sessionStorage.removeItem(PENDING_TARGET_KEY);
      } catch {
        /* ignore */
      }

      try {
        if (target.kind === 'chat') {
          await store.setActiveChat(target.id);
        } else if (target.kind === 'user') {
          await store.openUserProfile(target.id);
        } else if (target.kind === 'post') {
          store.setMainTab('wall');
          store.setCommentPostId(target.id);
        } else if (target.kind === 's' && store.token) {
          const link = await fetchApi(`/share-links/${target.id}`, {}, store.token);
          if (link.kind === 'user') await store.openUserProfile(link.targetId);
          else if (link.kind === 'post') {
            store.setMainTab('wall');
            store.setCommentPostId(link.targetId);
          } else if (link.kind === 'group' || link.kind === 'channel') {
            try {
              await store.joinByShareSlug(target.id);
            } catch {
              await store.setActiveChat(link.targetId);
            }
          }
          // Убираем /s/slug из адреса, иначе перезагрузка снова попытается войти.
          window.history.replaceState({}, '', '/');
        }
      } catch (e) {
        console.warn('не удалось открыть цель приглашения', e);
        store.showToast('Ссылка недействительна');
      }
    };
    void run();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.app}>
        <div className={styles.ambient} aria-hidden>
          <PatternBg pattern={AMBIENT_PATTERN} seed="tolk-auth" density="low" />
        </div>
        <div className={styles.authLayer}>
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      {/* Liquid Glass ambient blobs */}
      <div className="ambientBlobs" aria-hidden="true">
        <div className="ambientBlob" />
        <div className="ambientBlob" />
        <div className="ambientBlob" />
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
      <ChatInfoSheet />
      <MessageContextMenu />
      <ReactionPicker />
      <ShelfSheet />
      <CommentSheet />
      <ForwardSheet />
      <SettingsOverlay />
      <PeerProfile />
      <CallOverlay />
      <Toast />
    </div>
  );
}
