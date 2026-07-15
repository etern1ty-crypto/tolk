import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Bookmark,
  CircleDot,
  Mic,
  Palette,
  Paperclip,
  SendHorizontal,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CHAT_THEMES, useAppStore } from '../../store/appStore';
import { patternById } from '../../shared/patterns';
import { IconBtn } from '../../shared/ui/IconBtn';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatPanel.module.css';

function formatMsgTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatPanel() {
  const activeChatId = useAppStore((s) => s.activeChatId);
  const chats = useAppStore((s) => s.chats);
  const messages = useAppStore((s) => s.messages);
  const me = useAppStore((s) => s.me);
  const highlightMessageId = useAppStore((s) => s.highlightMessageId);
  const voiceRecording = useAppStore((s) => s.voiceRecording);
  const shelfItems = useAppStore((s) => s.shelfItems);
  const replyToId = useAppStore((s) => s.replyToId);
  const typingChatId = useAppStore((s) => s.typingChatId);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const retryMessage = useAppStore((s) => s.retryMessage);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const setReactionPicker = useAppStore((s) => s.setReactionPicker);
  const setAttachSheetOpen = useAppStore((s) => s.setAttachSheetOpen);
  const setCircleSheetOpen = useAppStore((s) => s.setCircleSheetOpen);
  const setVoiceRecording = useAppStore((s) => s.setVoiceRecording);
  const sendVoiceMock = useAppStore((s) => s.sendVoiceMock);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const toggleReaction = useAppStore((s) => s.toggleReaction);
  const setReplyTo = useAppStore((s) => s.setReplyTo);
  const setChatTheme = useAppStore((s) => s.setChatTheme);

  const [text, setText] = useState('');
  const [themeOpen, setThemeOpen] = useState(false);
  /** TG-style: mic button toggles voice ↔ circle */
  const [recordMode, setRecordMode] = useState<'voice' | 'circle'>('voice');
  const listRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const holdArmTimer = useRef<number | null>(null);
  const voiceHold = useRef(false);
  const didHoldRecord = useRef(false);

  const chat = chats.find((c) => c.id === activeChatId);
  const theme = patternById(CHAT_THEMES, chat?.themeId, CHAT_THEMES[0]!);
  const chatMessages = useMemo(
    () =>
      messages
        .filter((m) => m.chatId === activeChatId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [messages, activeChatId]
  );
  const shelfCount = shelfItems.filter((s) => s.chatId === activeChatId).length;
  const replyMsg = replyToId ? messages.find((m) => m.id === replyToId) : null;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, activeChatId, typingChatId]);

  useEffect(() => {
    if (!highlightMessageId) return;
    document
      .getElementById(`msg-${highlightMessageId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightMessageId]);

  if (!activeChatId || !chat) {
    return (
      <section className={styles.root} aria-label="Чат">
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <SendHorizontal size={iconProps.size.xl} strokeWidth={iconProps.strokeWidth} />
          </div>
          <p>Выберите чат</p>
          <p className={styles.placeholderSub}>
            Войсы, кружки и реакции — в диалоге
          </p>
        </div>
      </section>
    );
  }

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const clearHoldArm = () => {
    if (holdArmTimer.current != null) {
      window.clearTimeout(holdArmTimer.current);
      holdArmTimer.current = null;
    }
  };

  const endVoice = (send: boolean) => {
    if (!voiceHold.current && !voiceRecording) return;
    voiceHold.current = false;
    setVoiceRecording(false);
    if (send) sendVoiceMock();
  };

  const onRecordPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    didHoldRecord.current = false;
    clearHoldArm();
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    holdArmTimer.current = window.setTimeout(() => {
      didHoldRecord.current = true;
      if (recordMode === 'voice') {
        voiceHold.current = true;
        setVoiceRecording(true);
      } else {
        setCircleSheetOpen(true);
      }
    }, 180);
  };

  const onRecordPointerUp = () => {
    clearHoldArm();
    if (!didHoldRecord.current) {
      // short tap — switch voice ↔ circle (like Telegram)
      setRecordMode((m) => (m === 'voice' ? 'circle' : 'voice'));
      return;
    }
    if (recordMode === 'voice') {
      endVoice(true);
    }
    // circle: sheet handles capture/send
  };

  const onRecordPointerCancel = () => {
    clearHoldArm();
    if (didHoldRecord.current && recordMode === 'voice') {
      endVoice(false);
    }
    didHoldRecord.current = false;
  };

  return (
    <section className={styles.root} aria-label={`Чат ${chat.title}`}>
      <PatternBg
        pattern={theme}
        seed={chat.id}
        density="high"
        className={styles.wallpaper}
      />
      <header className={styles.header}>
        <IconBtn
          className={styles.mobileOnly}
          onClick={() => setActiveChat(null)}
          aria-label="К списку"
        >
          <ArrowLeft size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </IconBtn>
        <button
          type="button"
          className={styles.headerInfo}
          onClick={() => chat.peerId && openUserProfile(chat.peerId)}
        >
          <div className={styles.headerTitle}>{chat.title}</div>
          <div className={styles.headerSub}>
            {typingChatId === activeChatId ? (
              <span className={styles.typingLive}>печатает…</span>
            ) : chat.online ? (
              <span className={styles.online}>в сети</span>
            ) : chat.type === 'group' ? (
              'группа'
            ) : (
              'профиль'
            )}
          </div>
        </button>
        <IconBtn
          aria-label="Оформление чата"
          title="Оформление чата"
          onClick={() => setThemeOpen((v) => !v)}
        >
          <Palette size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </IconBtn>
        {shelfCount > 0 && (
          <button
            type="button"
            className={styles.shelfBtn}
            onClick={() => setShelfOpen(true)}
          >
            <Bookmark size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
            {shelfCount}
          </button>
        )}
      </header>

      <AnimatePresence>
        {themeOpen && (
          <motion.div
            className={styles.themeBar}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <span className={styles.themeLabel}>Фон чата</span>
            <div className={styles.themeRow}>
              {CHAT_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={
                    chat.themeId === t.id || (!chat.themeId && t.id === 'chat_dots')
                      ? styles.themeActive
                      : styles.themeChip
                  }
                  onClick={() => {
                    setChatTheme(chat.id, t.id);
                    setThemeOpen(false);
                  }}
                  title={t.label}
                >
                  <PatternBg pattern={t} seed={t.id} density="low" className={styles.themePreview} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.messages} ref={listRef}>
        <AnimatePresence initial={false}>
          {chatMessages.map((m) => {
            const mine = m.senderId === me.id;
            const reactionEntries = Object.entries(m.reactions);
            return (
              <motion.div
                key={m.id}
                id={`msg-${m.id}`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={[
                  styles.bubbleRow,
                  mine ? styles.mine : styles.theirs,
                  highlightMessageId === m.id ? styles.highlight : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div
                  className={[
                    styles.bubble,
                    m.status === 'failed' ? styles.failed : '',
                    m.isEcho ? styles.echoBubble : '',
                    m.kind === 'circle' ? styles.circleBubble : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ messageId: m.id, x: e.clientX, y: e.clientY });
                  }}
                  onDoubleClick={(e) => {
                    setReactionPicker({
                      messageId: m.id,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType === 'mouse') return;
                    longPressTimer.current = window.setTimeout(() => {
                      setContextMenu({
                        messageId: m.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }, 300);
                  }}
                  onPointerUp={() => {
                    if (longPressTimer.current) {
                      window.clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onPointerLeave={() => {
                    if (longPressTimer.current) {
                      window.clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                >
                  {m.replyPreview && (
                    <div className={styles.replyQuote}>{m.replyPreview}</div>
                  )}
                  {m.isEcho && <span className={styles.echoTag}>Echo</span>}
                  {m.kind === 'voice' && (
                    <div className={styles.voice}>
                      <span className={styles.play}>
                        <Mic size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
                      </span>
                      <span className={styles.wave}>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                      <span>
                        0:{String(m.durationSec ?? 0).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {m.kind === 'circle' && (
                    <div className={styles.circleMsg}>
                      <div className={styles.circleDisk}>
                        <CircleDot size={36} strokeWidth={iconProps.strokeWidth} />
                      </div>
                      <span>Кружок · {m.durationSec ?? 5}с</span>
                    </div>
                  )}
                  {(m.kind === 'text' ||
                    m.kind === 'file' ||
                    m.kind === 'media') && (
                    <div className={styles.bubbleText}>{m.text}</div>
                  )}
                  <div className={styles.bubbleMeta}>
                    <span>{formatMsgTime(m.createdAt)}</span>
                    {mine && m.status === 'pending' && <span>…</span>}
                    {mine && m.status === 'sent' && <span>✓</span>}
                    {mine && m.status === 'failed' && (
                      <button
                        type="button"
                        className={styles.retry}
                        onClick={() => retryMessage(m.id)}
                      >
                        повторить
                      </button>
                    )}
                  </div>
                  {reactionEntries.length > 0 && (
                    <div className={styles.reactions}>
                      {reactionEntries.map(([emoji, users]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(m.id, emoji)}
                        >
                          {emoji} {users.length}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {typingChatId === activeChatId && (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <AnimatePresence>
        {voiceRecording && (
          <motion.div
            className={styles.voiceBar}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <span className={styles.recPulse} />
            Запись… отпустите, чтобы отправить
            <button type="button" onClick={() => endVoice(false)}>
              Отмена
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {replyMsg && (
        <div className={styles.replyBar}>
          <div>
            <strong>Ответ</strong>
            <span>{replyMsg.text.slice(0, 60)}</span>
          </div>
          <IconBtn size="sm" onClick={() => setReplyTo(null)} aria-label="Отменить">
            <X size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
        </div>
      )}

      <footer className={styles.composer}>
        <IconBtn onClick={() => setAttachSheetOpen(true)} aria-label="Вложение">
          <Paperclip size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </IconBtn>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyMsg ? 'Ответ…' : 'Сообщение'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {text.trim() ? (
          <IconBtn
            variant="mint"
            className={styles.send}
            onClick={submit}
            aria-label="Отправить"
          >
            <SendHorizontal size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
        ) : (
          <IconBtn
            variant="soft"
            className={`${styles.mic} ${recordMode === 'circle' ? styles.micCircle : ''}`}
            aria-label={
              recordMode === 'voice'
                ? 'Голосовое. Нажмите — кружок'
                : 'Кружок. Нажмите — голосовое'
            }
            title={
              recordMode === 'voice'
                ? 'Тап — кружок · Удержание — войс'
                : 'Тап — войс · Удержание — кружок'
            }
            onPointerDown={onRecordPointerDown}
            onPointerUp={onRecordPointerUp}
            onPointerCancel={onRecordPointerCancel}
          >
            {recordMode === 'voice' ? (
              <Mic size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
            ) : (
              <CircleDot size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
            )}
          </IconBtn>
        )}
      </footer>
    </section>
  );
}
