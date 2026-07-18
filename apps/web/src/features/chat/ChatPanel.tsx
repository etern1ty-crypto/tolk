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
  Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CHAT_THEMES, useAppStore, fetchApi } from '../../store/appStore';
import { patternById } from '../../shared/patterns';
import { formatReplyPreview } from '../../shared/lib/messagePreview';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { MediaLightbox } from '../../shared/ui/MediaLightbox';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatPanel.module.css';
import { GlobalMediaPlayer } from './GlobalMediaPlayer';
import { formatLastSeen } from '../profile/PeerProfile';

function formatMsgTime(ts: any) {
  const parsed = typeof ts === 'string' && /^\d+$/.test(ts) ? Number(ts) : ts;
  return new Date(parsed).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatPanel() {
  const activeChatId = useAppStore((s) => s.activeChatId);
  const chats = useAppStore((s) => s.chats);
  const messages = useAppStore((s) => s.messages);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const activeMediaId = useAppStore((s) => s.activeMediaId);
  const setActiveMediaId = useAppStore((s) => s.setActiveMediaId);
  const globalChatThemeId = useAppStore((s) => s.globalChatThemeId);
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
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const toggleReaction = useAppStore((s) => s.toggleReaction);
  const setReplyTo = useAppStore((s) => s.setReplyTo);
  const setChatTheme = useAppStore((s) => s.setChatTheme);
  const uploadAttachment = useAppStore((s) => s.uploadAttachment);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const swipeActiveId = useRef<string | null>(null);
  const swipeDxRef = useRef(0);
  const [swipeDx, setSwipeDx] = useState(0);
  const [swipeMsgId, setSwipeMsgId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachment(file, 'media');
    }
  };

  const [text, setText] = useState('');
  const [themeOpen, setThemeOpen] = useState(false);
  /** TG-style: mic button toggles voice ↔ circle */
  const [recordMode, setRecordMode] = useState<'voice' | 'circle'>('voice');
  const listRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const holdArmTimer = useRef<number | null>(null);
  const voiceHold = useRef(false);
  const didHoldRecord = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);

  const chat = chats.find((c) => c.id === activeChatId);
  const theme = patternById(CHAT_THEMES, chat?.themeId || globalChatThemeId, CHAT_THEMES[0]!);
  const globalCustomWallpaper = useAppStore((s) => s.globalCustomWallpaper);
  const customWp = chat?.customWallpaperRef || globalCustomWallpaper;
  const chatMessages = useMemo(
    () => {
      const seen = new Set();
      return messages
        .filter((m) => m.chatId === activeChatId)
        .filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        })
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    [messages, activeChatId]
  );
  const shelfCount = shelfItems.filter((s) => s.chatId === activeChatId).length;
  const replyMsg = replyToId ? messages.find((m) => m.id === replyToId) : null;
  const replyAuthor = replyMsg
    ? replyMsg.senderId === me.id
      ? me
      : users[replyMsg.senderId]
    : null;
  const headerPeer = chat?.peerId ? users[chat.peerId] : null;
  const headerAvatarName = headerPeer?.displayName || chat?.title || '?';
  const headerAvatarUrl = headerPeer?.avatarRef || chat?.avatarRef;
  const headerAvatarId = headerPeer?.id || chat?.id;

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

  const endVoice = async (send: boolean) => {
    if (!voiceHold.current && !voiceRecording) return;
    voiceHold.current = false;
    setVoiceRecording(false);
    
    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = async () => {
        const durationSec = Math.max(1, Math.round((Date.now() - recordStartTimeRef.current) / 1000));
        
        if (send && audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const file = new File([blob], 'voice.webm', { type: blob.type });
          
          const token = useAppStore.getState().token;
          const chatId = activeChatId;
          if (chatId) {
            try {
              // @ts-ignore
              useAppStore.getState().showToast('Отправка голосового...');
              
              const uploadRes = await fetchApi('/media/uploads', {
                method: 'POST',
                body: JSON.stringify({
                  mime: file.type || 'audio/webm',
                  size: file.size,
                  kind: 'file'
                })
              }, token);

              const s3Res = await fetch(uploadRes.upload_url, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type || 'audio/webm'
                }
              });

              if (!s3Res.ok) {
                throw new Error(`Failed to upload voice: ${s3Res.statusText}`);
              }

              await fetchApi(`/media/${uploadRes.media_id}/complete`, {
                method: 'POST',
                body: JSON.stringify({})
              }, token);

              await sendMessage('Голосовое сообщение', {
                kind: 'voice',
                media: {
                  url: uploadRes.public_url,
                  durationSec,
                  filename: 'voice.webm',
                  mime: file.type,
                  size: file.size
                }
              });
            } catch (err: any) {
              console.error('Failed to upload voice recording:', err);
              // @ts-ignore
              useAppStore.getState().showToast('Ошибка отправки голосового');
            }
          }
        }
        
        stream?.getTracks().forEach((track) => track.stop());
      };
      
      recorder.stop();
    } else {
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const onRecordPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    didHoldRecord.current = false;
    clearHoldArm();
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    holdArmTimer.current = window.setTimeout(async () => {
      didHoldRecord.current = true;
      if (recordMode === 'voice') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          audioChunksRef.current = [];
          
          let options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 };
          let recorder: MediaRecorder;
          try {
            recorder = new MediaRecorder(stream, options);
          } catch {
            recorder = new MediaRecorder(stream);
          }
          
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          recorder.start();
          recordStartTimeRef.current = Date.now();
          voiceHold.current = true;
          setVoiceRecording(true);
        } catch (err) {
          console.error('Error starting audio recording:', err);
          // @ts-ignore
          useAppStore.getState().showToast('Доступ к микрофону отклонен');
          didHoldRecord.current = false;
        }
      } else {
        setCircleSheetOpen(true);
      }
    }, 180);
  };

  const onRecordPointerUp = () => {
    clearHoldArm();
    if (!didHoldRecord.current) {
      setRecordMode((m) => (m === 'voice' ? 'circle' : 'voice'));
      return;
    }
    if (recordMode === 'voice') {
      void endVoice(true);
    }
  };

  const onRecordPointerCancel = () => {
    clearHoldArm();
    if (didHoldRecord.current && recordMode === 'voice') {
      void endVoice(false);
    }
    didHoldRecord.current = false;
  };

  return (
    <section className={styles.root} aria-label={`Чат ${chat.title}`}>
      {customWp ? (
        <div
          className={styles.wallpaper}
          style={{
            backgroundImage: `url(${customWp})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <PatternBg
          pattern={theme}
          seed={chat.id}
          density="high"
          className={styles.wallpaper}
        />
      )}
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
          <Avatar
            name={headerAvatarName}
            id={headerAvatarId}
            avatarUrl={headerAvatarUrl}
            size={36}
            online={chat.type === 'dm' ? chat.online : undefined}
          />
          <div className={styles.headerText}>
            <div className={styles.headerTitle}>{chat.title}</div>
            <div className={styles.headerSub}>
              {typingChatId === activeChatId ? (
                <span className={styles.typingLive}>печатает…</span>
              ) : chat.online ? (
                <span className={styles.online}>в сети</span>
              ) : chat.type === 'group' || chat.type === 'channel' ? (
                chat.type === 'channel' ? 'канал' : 'группа'
              ) : chat.peerId && users[chat.peerId]?.lastSeenAt ? (
                formatLastSeen(users[chat.peerId].lastSeenAt)
              ) : (
                'был(а) недавно'
              )}
            </div>
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

      <GlobalMediaPlayer />
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
                  style={
                    swipeMsgId === m.id
                      ? {
                          transform: `translateX(${Math.min(Math.max(swipeDx, 0), 72)}px)`,
                          transition: swipeDx === 0 ? 'transform 0.18s ease' : 'none',
                        }
                      : undefined
                  }
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
                    swipeStartX.current = e.clientX;
                    swipeStartY.current = e.clientY;
                    swipeActiveId.current = m.id;
                    setSwipeMsgId(m.id);
                    longPressTimer.current = window.setTimeout(() => {
                      setContextMenu({
                        messageId: m.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                      swipeActiveId.current = null;
                      setSwipeMsgId(null);
                      swipeDxRef.current = 0;
                      setSwipeDx(0);
                    }, 300);
                  }}
                  onPointerMove={(e) => {
                    if (e.pointerType === 'mouse' || swipeActiveId.current !== m.id) return;
                    const dx = e.clientX - swipeStartX.current;
                    const dy = e.clientY - swipeStartY.current;
                    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
                      if (longPressTimer.current) {
                        window.clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                      swipeDxRef.current = dx;
                      setSwipeDx(dx);
                    }
                  }}
                  onPointerUp={() => {
                    if (longPressTimer.current) {
                      window.clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                    if (swipeActiveId.current === m.id && swipeDxRef.current > 56) {
                      setReplyTo(m.id);
                    }
                    swipeActiveId.current = null;
                    setSwipeMsgId(null);
                    swipeDxRef.current = 0;
                    setSwipeDx(0);
                  }}
                  onPointerLeave={() => {
                    if (longPressTimer.current) {
                      window.clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                    swipeActiveId.current = null;
                    setSwipeMsgId(null);
                    swipeDxRef.current = 0;
                    setSwipeDx(0);
                  }}
                  onPointerCancel={() => {
                    if (longPressTimer.current) {
                      window.clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                    swipeActiveId.current = null;
                    setSwipeMsgId(null);
                    swipeDxRef.current = 0;
                    setSwipeDx(0);
                  }}
                >
                  {(m.replyPreview || m.replyToId) && (
                    <div className={styles.replyQuote}>
                      {m.replyPreview || formatReplyPreview(messages.find((x) => x.id === m.replyToId))}
                    </div>
                  )}
                  {m.isEcho && <span className={styles.echoTag}>Echo</span>}
                  {m.kind === 'voice' && (
                    m.media?.url ? (
                      <div className={styles.voice} onClick={() => useAppStore.getState().setActiveMediaId(m.id)}>
                        <audio data-media-id={m.id} src={m.media.url} preload="metadata" />
                        <span className={styles.play}>
                          <Mic size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
                        </span>
                        <span className={styles.wave}>
                          <i /><i /><i /><i /><i /><i /><i /><i />
                        </span>
                        <span>
                          0:{String(m.media.durationSec ?? 0).padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
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
                    )
                  )}
                  {m.kind === 'circle' && (
                    m.media?.url ? (
                      <div
                        style={{ 
                          width: '180px', 
                          height: '180px', 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          border: '2px solid var(--accent)',
                          position: 'relative',
                          background: '#000',
                          cursor: 'pointer',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                        onClick={() => setActiveMediaId(activeMediaId === m.id ? null : m.id)}
                        title="Нажмите, чтобы включить видео"
                      >
                        <video 
                          data-media-id={m.id}
                          src={m.media.url} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            filter: activeMediaId === m.id ? 'none' : 'grayscale(1) brightness(0.7)'
                          }}
                          playsInline
                        />
                      </div>
                    ) : (
                      <div className={styles.circleMsg}>
                        <div className={styles.circleDisk}>
                          <CircleDot size={36} strokeWidth={iconProps.strokeWidth} />
                        </div>
                        <span>Кружок · {m.durationSec ?? 5}с</span>
                      </div>
                    )
                  )}
                  {m.kind === 'media' && m.media?.url && (
                    <button
                      type="button"
                      className={styles.mediaThumb}
                      onClick={() => setLightboxSrc(m.media!.url)}
                      aria-label="Открыть фото"
                    >
                      <img src={m.media.url} alt="Attachment" />
                    </button>
                  )}
                  {m.kind === 'file' && m.media?.url && (
                    <a 
                      href={m.media.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        textDecoration: 'underline', 
                        color: 'var(--accent)', 
                        fontSize: '14px', 
                        margin: '6px 0',
                        fontWeight: '600'
                      }}
                    >
                      <span>📄</span>
                      <span>{m.media.filename || m.text || 'Скачать файл'}</span>
                    </a>
                  )}
                  {(m.kind === 'text' || (!m.media?.url && (m.kind === 'file' || m.kind === 'media'))) && (
                    <div className={styles.bubbleText}>{m.text}</div>
                  )}
                  {m.kind === 'media' && m.media?.url && m.text && !m.text.includes('mock attachment') && (
                    <div className={styles.bubbleText} style={{ marginTop: '4px' }}>{m.text}</div>
                  )}
                  <div className={styles.bubbleMeta}>
                    <span>{formatMsgTime(m.createdAt)}</span>
                    {mine && m.status === 'pending' && <span className={styles.checkmarks}>…</span>}
                    {mine && m.status !== 'pending' && m.status !== 'failed' && (
                      (chat && m.seq !== undefined && m.seq <= (chat.peerLastReadSeq || 0)) ? (
                        <span className={styles.checkmarks} title="Прочитано">✓✓</span>
                      ) : (
                        <span className={styles.checkmarks} title="Отправлено">✓</span>
                      )
                    )}
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

      <div className={styles.composerStack}>
      {replyMsg && (
        <div className={styles.replyBar}>
          <div className={styles.replyBarBody}>
            <strong>
              Ответ · {replyAuthor?.displayName ?? 'сообщение'}
            </strong>
            <span>{formatReplyPreview(replyMsg)}</span>
          </div>
          <IconBtn size="sm" onClick={() => setReplyTo(null)} aria-label="Отменить">
            <X size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
        </div>
      )}

      <footer className={styles.composer}>
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        <IconBtn onClick={() => imageInputRef.current?.click()} aria-label="Галерея">
          <ImageIcon size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </IconBtn>
        <IconBtn onClick={() => setAttachSheetOpen(true)} aria-label="Вложение">
          <Paperclip size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </IconBtn>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            useAppStore.getState().sendTypingPresence();
          }}
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
      </div>
      <MediaLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </section>
  );
}
