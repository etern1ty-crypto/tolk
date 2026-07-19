import {
  ArrowLeft,
  Bookmark,
  CircleDot,
  Mic,
  MoreVertical,
  Palette,
  SendHorizontal,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from 'react';
import { CHAT_THEMES, useAppStore, fetchApi } from '../../store/appStore';
import { patternById } from '../../shared/patterns';
import { formatReplyPreview } from '../../shared/lib/messagePreview';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { MediaLightbox } from '../../shared/ui/MediaLightbox';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import { ChatThemePicker } from '../settings/ChatThemePicker';
import styles from './ChatPanel.module.css';
import { GlobalMediaPlayer } from './GlobalMediaPlayer';
import { MediaSendPreview } from './MediaSendPreview';
import { VoicePlayer } from './MessageVoiceBubble';
import { formatLastSeen } from '../profile/PeerProfile';

/** How many newest messages stay mounted. Expand on scroll-up. */
const MSG_WINDOW = 48;
const MSG_WINDOW_STEP = 40;

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
  // attach sheet removed from UI — photo only via gallery button
  const setCircleSheetOpen = useAppStore((s) => s.setCircleSheetOpen);
  const setVoiceRecording = useAppStore((s) => s.setVoiceRecording);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const toggleReaction = useAppStore((s) => s.toggleReaction);
  const defaultReaction = useAppStore((s) => s.defaultReaction);
  const setReplyTo = useAppStore((s) => s.setReplyTo);
  const setChatTheme = useAppStore((s) => s.setChatTheme);
  const uploadAttachment = useAppStore((s) => s.uploadAttachment);
  const setChatInfoOpen = useAppStore((s) => s.setChatInfoOpen);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const themeBarRef = useRef<HTMLDivElement>(null);

  const closeChatOverlays = useCallback(() => {
    setHeaderMenuOpen(false);
    setThemeOpen(false);
  }, []);

  // Close ⋯ menu / theme bar on outside click or Escape
  useEffect(() => {
    if (!headerMenuOpen && !themeOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (headerMenuRef.current?.contains(t)) return;
      if (themeBarRef.current?.contains(t)) return;
      setHeaderMenuOpen(false);
      setThemeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChatOverlays();
    };
    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointer, true);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [headerMenuOpen, themeOpen, closeChatOverlays]);

  // Reset overlays when switching chats
  useEffect(() => {
    closeChatOverlays();
  }, [activeChatId, closeChatOverlays]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const swipeActiveId = useRef<string | null>(null);
  const swipeDxRef = useRef(0);
  const [swipeDx, setSwipeDx] = useState(0);
  const [swipeMsgId, setSwipeMsgId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [pendingCaption, setPendingCaption] = useState('');
  const [sendingImage, setSendingImage] = useState(false);

  const queueImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      void uploadAttachment(file, 'file');
      return;
    }
    if (pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage({ file, preview: URL.createObjectURL(file) });
    setPendingCaption('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) queueImage(file);
    e.target.value = '';
  };

  const confirmPendingImage = async (file?: File, caption?: string) => {
    if (!pendingImage || sendingImage) return;
    setSendingImage(true);
    try {
      await uploadAttachment(
        file || pendingImage.file,
        'media',
        caption !== undefined ? caption : pendingCaption
      );
      URL.revokeObjectURL(pendingImage.preview);
      setPendingImage(null);
      setPendingCaption('');
    } finally {
      setSendingImage(false);
    }
  };

  const [text, setText] = useState('');
  /** TG-style: mic button toggles voice ↔ circle */
  const [recordMode, setRecordMode] = useState<'voice' | 'circle'>('voice');
  /** Windowed render — only last N messages in DOM */
  const [visibleLimit, setVisibleLimit] = useState(MSG_WINDOW);
  const listRef = useRef<HTMLDivElement>(null);
  const stickBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const longPressTimer = useRef<number | null>(null);
  const holdArmTimer = useRef<number | null>(null);
  const voiceHold = useRef(false);
  const didHoldRecord = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);

  const previewChat = useAppStore((s) => s.previewChat);
  const joinChat = useAppStore((s) => s.joinChat);
  const isPreview =
    !!previewChat &&
    previewChat.id === activeChatId &&
    !chats.some((c) => c.id === activeChatId);
  const chat = chats.find((c) => c.id === activeChatId) || (isPreview ? previewChat : undefined);
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

  const hasOlder = chatMessages.length > visibleLimit;
  const windowStart = Math.max(0, chatMessages.length - visibleLimit);
  const visibleMessages = useMemo(
    () => (hasOlder ? chatMessages.slice(windowStart) : chatMessages),
    [chatMessages, hasOlder, windowStart]
  );

  // Reset window when switching chats
  useEffect(() => {
    setVisibleLimit(MSG_WINDOW);
    stickBottomRef.current = true;
  }, [activeChatId]);

  // Keep newest messages visible when length grows while pinned to bottom
  useEffect(() => {
    if (stickBottomRef.current) {
      setVisibleLimit((n) => Math.max(n, Math.min(MSG_WINDOW, chatMessages.length)));
    }
  }, [chatMessages.length]);

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
    if (!el || !stickBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, activeChatId, typingChatId, visibleMessages.length]);

  useEffect(() => {
    if (!highlightMessageId) return;
    const idx = chatMessages.findIndex((m) => m.id === highlightMessageId);
    if (idx < 0) return;
    // Expand window so target is mounted
    const fromEnd = chatMessages.length - idx;
    if (fromEnd > visibleLimit) {
      setVisibleLimit(fromEnd + 8);
    }
    window.requestAnimationFrame(() => {
      document
        .getElementById(`msg-${highlightMessageId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [highlightMessageId, chatMessages, visibleLimit]);

  const loadOlder = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingOlderRef.current || !hasOlder) return;
    loadingOlderRef.current = true;
    const prevH = el.scrollHeight;
    const prevTop = el.scrollTop;
    setVisibleLimit((n) => Math.min(chatMessages.length, n + MSG_WINDOW_STEP));
    window.requestAnimationFrame(() => {
      const node = listRef.current;
      if (node) {
        node.scrollTop = node.scrollHeight - prevH + prevTop;
      }
      loadingOlderRef.current = false;
    });
  }, [hasOlder, chatMessages.length]);

  const onMessagesScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickBottomRef.current = dist < 96;
      if (el.scrollTop < 56) loadOlder();
    },
    [loadOlder]
  );

  /* Mobile: swipe from right edge → Chat Wall (полка) */
  useEffect(() => {
    if (!activeChatId) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX < window.innerWidth - 28) return;
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (dx < -56 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        setShelfOpen(true);
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [activeChatId, setShelfOpen]);

  // Paste image from clipboard (desktop)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!activeChatId) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            queueImage(file);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [activeChatId, pendingImage]);

  if (!activeChatId || !chat) {
    return (
      <section className={styles.root} aria-label="Чат">
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <SendHorizontal size={iconProps.size.xl} strokeWidth={iconProps.strokeWidth} />
          </div>
          <p>Выберите чат</p>
          <p className={styles.placeholderSub}>Список слева</p>
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
              
              const voiceMime = (file.type || 'audio/webm').split(';')[0] || 'audio/webm';
              const uploadRes = await fetchApi('/media/uploads', {
                method: 'POST',
                body: JSON.stringify({
                  mime: voiceMime,
                  size: file.size,
                  kind: 'voice'
                })
              }, token);

              const s3Res = await fetch(uploadRes.upload_url, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': voiceMime,
                  Authorization: `Bearer ${token}`,
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
          density="low"
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
          onClick={(e) => {
            e.preventDefault();
            if (chat.type === 'dm' && chat.peerId) {
              openUserProfile(chat.peerId);
              return;
            }
            window.setTimeout(() => setChatInfoOpen(true), 0);
          }}
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
                `${chat.type === 'channel' ? 'канал' : 'группа'}${
                  chat.memberCount ? ` · ${chat.memberCount}` : ''
                }`
              ) : chat.peerId && users[chat.peerId]?.lastSeenAt ? (
                formatLastSeen(users[chat.peerId].lastSeenAt)
              ) : (
                'был(а) недавно'
              )}
            </div>
          </div>
        </button>
        <div className={styles.headerActions} ref={headerMenuRef}>
          <IconBtn
            aria-label="Ещё"
            title="Ещё"
            onClick={() => {
              setThemeOpen(false);
              setHeaderMenuOpen((v) => !v);
            }}
          >
            <MoreVertical size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
          {headerMenuOpen && (
            <div className={styles.headerMenu} role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  setThemeOpen(true);
                }}
              >
                <Palette size={16} /> Оформление
              </button>
              {!isPreview && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    setThemeOpen(false);
                    setShelfOpen(true);
                  }}
                >
                  <Bookmark size={16} /> Избранное
                  {shelfCount > 0 ? ` · ${shelfCount}` : ''}
                </button>
              )}
              {(chat.type === 'group' || chat.type === 'channel') && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHeaderMenuOpen(false);
                    setThemeOpen(false);
                    window.setTimeout(() => setChatInfoOpen(true), 0);
                  }}
                >
                  Инфо
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {themeOpen && (
        <div className={styles.themeBar} ref={themeBarRef}>
          <div className={styles.themeBarHead}>
            <span className={styles.themeLabel}>Фон чата</span>
            <IconBtn
              aria-label="Закрыть оформление"
              onClick={() => setThemeOpen(false)}
            >
              <X size={16} strokeWidth={iconProps.strokeWidth} />
            </IconBtn>
          </div>
          <ChatThemePicker
            compact
            value={chat.themeId || globalChatThemeId}
            onSelect={(id) => {
              setChatTheme(chat.id, id);
              setThemeOpen(false);
            }}
          />
        </div>
      )}

      <GlobalMediaPlayer />
      <div className={styles.messages} ref={listRef} onScroll={onMessagesScroll}>
        {hasOlder && (
          <div className={styles.loadOlder}>
            <button type="button" className={styles.loadOlderBtn} onClick={loadOlder}>
              Раньше · {chatMessages.length - visibleMessages.length}
            </button>
          </div>
        )}
        {visibleMessages.map((m, idx) => {
            const mine = m.senderId === me.id;
            const reactionEntries = Object.entries(m.reactions);
            const globalIdx = windowStart + idx;
            const isLatest = globalIdx === chatMessages.length - 1;
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                className={[
                  styles.bubbleRow,
                  mine ? styles.mine : styles.theirs,
                  highlightMessageId === m.id ? styles.highlight : '',
                  isLatest && mine && m.status === 'pending' ? styles.bubbleEnter : '',
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
                  style={{
                    touchAction: 'pan-y',
                    ...(swipeMsgId === m.id
                      ? {
                          transform: `translateX(${Math.min(Math.max(swipeDx, 0), 72)}px)`,
                          transition: swipeDx === 0 ? 'transform 0.18s ease' : 'none',
                        }
                      : {}),
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ messageId: m.id, x: e.clientX, y: e.clientY });
                  }}
                  onDoubleClick={() => {
                    // Quick reaction (default from settings) — full picker is in long-press menu
                    toggleReaction(m.id, defaultReaction || '👍');
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
                    <VoicePlayer
                      src={m.media?.url || ''}
                      durationSec={m.media?.durationSec ?? m.durationSec}
                      seed={m.id}
                      messageId={m.id}
                      mine={mine}
                    />
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
                    {mine && m.status === 'pending' && <span className={styles.checkmarks}>·</span>}
                    {mine && m.status !== 'pending' && m.status !== 'failed' && (
                      (chat && m.seq !== undefined && m.seq <= (chat.peerLastReadSeq || 0)) ? (
                        <span className={`${styles.checkmarks} ${styles.read}`} title="Прочитано" aria-label="Прочитано">
                          <i /><i />
                        </span>
                      ) : (
                        <span className={styles.checkmarks} title="Отправлено" aria-label="Отправлено">
                          <i />
                        </span>
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
              </div>
            );
          })}
        {typingChatId === activeChatId && (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {voiceRecording && (
        <div className={styles.voiceBar}>
          <span className={styles.recPulse} />
          Запись… отпустите, чтобы отправить
          <button type="button" onClick={() => endVoice(false)}>
            Отмена
          </button>
        </div>
      )}

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

      {pendingImage && (
        <MediaSendPreview
          file={pendingImage.file}
          previewUrl={pendingImage.preview}
          caption={pendingCaption}
          onCaption={setPendingCaption}
          sending={sendingImage}
          onCancel={() => {
            URL.revokeObjectURL(pendingImage.preview);
            setPendingImage(null);
            setPendingCaption('');
          }}
          onSend={async (file, cap) => {
            await confirmPendingImage(file, cap);
          }}
        />
      )}

      {/* Preview: only Subscribe. Subscribed channel members (non-admin): no footer at all. */}
      {isPreview ? (
        <footer className={styles.composer}>
          <button
            type="button"
            className={styles.subscribeBtn}
            onClick={() => void joinChat(chat.id)}
          >
            Подписаться
          </button>
        </footer>
      ) : chat.type === 'channel' &&
        chat.myRole !== 'owner' &&
        chat.myRole !== 'admin' ? null : (
        <footer className={styles.composer}>
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <IconBtn onClick={() => imageInputRef.current?.click()} aria-label="Фото">
            <ImageIcon size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
          {/* File / attach menu removed (YAGNI) — only photo for now */}
          <input
            className={styles.input}
            value={text}
            onFocus={() => closeChatOverlays()}
            onChange={(e) => {
              closeChatOverlays();
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
      )}
      </div>
      <MediaLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </section>
  );
}
