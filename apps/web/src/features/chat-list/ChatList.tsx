import { PenSquare, Pin, Search, User, Trash2, Ban } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { Avatar } from '../../shared/ui/Avatar';
import { VerifiedBadge } from '../../shared/ui/VerifiedBadge';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatList.module.css';
import { createShareUrl } from '../../shared/lib/share';
import { SkeletonList } from '../../shared/ui/Skeleton';

interface ChatMenuState {
  chatId: string;
  x: number;
  y: number;
  peerId?: string;
  isPinned: boolean;
}

export function ChatList() {
  const chats = useAppStore((s) => s.chats);
  const users = useAppStore((s) => s.users);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const [inviting, setInviting] = useState(false);
  const booting = useAppStore((s) => s.booting);

  const [chatMenu, setChatMenu] = useState<ChatMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);

  const inviteFriend = async () => {
    const { me, token, showToast } = useAppStore.getState();
    if (!me?.id) return;
    setInviting(true);
    try {
      const url = await createShareUrl('user', me.id, token);
      if (navigator.share) {
        await navigator.share({ title: 'Толк', text: 'Напиши мне в Толке', url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Ссылка скопирована');
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') {
        useAppStore.getState().showToast('Не удалось создать ссылку');
      }
    } finally {
      setInviting(false);
    }
  };

  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const navPins = useAppStore((s) => s.navPins);
  const toggleNavPin = useAppStore((s) => s.toggleNavPin);
  const blockUser = useAppStore((s) => s.blockUser);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!chatMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setChatMenu(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [chatMenu]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const sorted = [...chats].sort((a, b) => {
      const aTime = a.latestMessageCreatedAt || 0;
      const bTime = b.latestMessageCreatedAt || 0;
      return bTime - aTime;
    });

    const pinned = sorted.filter((c) => c.pinned || navPins.includes(c.id));
    const normal = sorted.filter((c) => !(c.pinned || navPins.includes(c.id)));
    const combined = [...pinned, ...normal];

    if (!q) return combined;
    return combined.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
    );
  }, [chats, searchQuery, navPins]);

  const openMenuAt = (chatId: string, x: number, y: number, peerId?: string, isPinned = false) => {
    const menuWidth = 220;
    const menuHeight = 180;
    const posX = Math.min(x, window.innerWidth - menuWidth - 10);
    const posY = Math.min(y, window.innerHeight - menuHeight - 10);

    setChatMenu({
      chatId,
      x: Math.max(10, posX),
      y: Math.max(10, posY),
      peerId,
      isPinned,
    });
  };

  return (
    <section className={styles.root} aria-label="Список чатов">
      <header className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
        <div className={styles.headerActions}>
          {!isDesktop && (
            <button
              type="button"
              className={styles.iconAction}
              onClick={() => {
                setMainTab('search');
                window.requestAnimationFrame(() => {
                  document.getElementById('tolk-global-search')?.focus();
                });
              }}
              aria-label="Поиск"
            >
              <Search size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconAction}
            onClick={() => setNewChatOpen(true)}
            aria-label="Новый чат"
          >
            <PenSquare size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {booting && chats.length === 0 ? (
          <div className={styles.skeletonWrap}>
            <SkeletonList count={6} kind="chat" />
          </div>
        ) : (
          filtered.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Напишите первым</p>
              <p className={styles.emptySub}>
                Мессенджер начинается со второго человека
              </p>
              <div className={styles.emptyActions}>
                <button
                  type="button"
                  className={styles.emptyPrimary}
                  onClick={() => setMainTab('wall')}
                >
                  Смотреть стену
                </button>
                <button
                  type="button"
                  className={styles.emptyGhost}
                  onClick={inviteFriend}
                  disabled={inviting}
                >
                  {inviting ? 'Готовим ссылку…' : 'Пригласить друга'}
                </button>
              </div>
              <button
                type="button"
                className={styles.emptyQuiet}
                onClick={() => setNewChatOpen(true)}
              >
                Знаете @username — напишите сразу
              </button>
            </div>
          )
        )}

        {filtered.map((chat) => {
          const isPinned = chat.pinned || navPins.includes(chat.id);
          const peerUser = chat.peerId ? users[chat.peerId] : null;
          const isVerified =
            peerUser && (peerUser.verified || peerUser.username === 'nekach' || peerUser.username === 'admin');

          return (
            <div
              key={chat.id}
              className={`${styles.row} ${activeChatId === chat.id ? styles.rowActive : ''}`}
              onContextMenu={(e) => {
                e.preventDefault();
                openMenuAt(chat.id, e.clientX, e.clientY, chat.peerId, isPinned);
              }}
              onPointerDown={(e) => {
                if (e.pointerType === 'mouse') return;
                longPressTriggered.current = false;
                const clientX = e.clientX;
                const clientY = e.clientY;
                longPressTimer.current = window.setTimeout(() => {
                  longPressTriggered.current = true;
                  openMenuAt(chat.id, clientX, clientY, chat.peerId, isPinned);
                }, 320);
              }}
              onPointerUp={() => {
                if (longPressTimer.current) {
                  window.clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
              onPointerCancel={() => {
                if (longPressTimer.current) {
                  window.clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
            >
              <button
                type="button"
                className={styles.avatarBtn}
                onClick={() => chat.peerId && openUserProfile(chat.peerId)}
                aria-label={`Профиль ${chat.title}`}
              >
                <Avatar
                  name={chat.title}
                  id={chat.peerId || chat.id}
                  avatarUrl={chat.avatarRef}
                  online={chat.online}
                  size={isDesktop ? 44 : 48}
                />
              </button>
              <button
                type="button"
                className={styles.rowMain}
                onClick={() => {
                  if (longPressTriggered.current) return;
                  setActiveChat(chat.id);
                }}
              >
                <div className={styles.meta}>
                  <div className={styles.rowTop}>
                    <span className={styles.name}>
                      {isPinned && (
                        <Pin
                          size={12}
                          strokeWidth={iconProps.strokeWidth}
                          className={styles.pinIcon}
                          aria-hidden
                        />
                      )}
                      <span>{chat.title}</span>
                      {isVerified && <VerifiedBadge size="sm" />}
                      {chat.muted && <span className={styles.muted}>тихий</span>}
                    </span>
                    <span className={styles.time}>{chat.timeLabel}</span>
                  </div>
                  <div className={styles.rowBottom}>
                    <span className={styles.preview}>{chat.preview}</span>
                    {chat.unread > 0 && (
                      <span className={styles.tBadge} data-open={chat.unread > 0}>
                        <span className={styles.tBadgeDot}>{chat.unread > 9 ? '9+' : chat.unread}</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Chat Context Menu Popover */}
      {chatMenu && (
        <div
          ref={menuRef}
          className={styles.contextMenuPopover}
          style={{ top: `${chatMenu.y}px`, left: `${chatMenu.x}px` }}
        >
          <button
            type="button"
            onClick={() => {
              toggleNavPin(chatMenu.chatId);
              setChatMenu(null);
            }}
          >
            <Pin size={15} />
            <span>{chatMenu.isPinned ? 'Открепить чат' : 'Закрепить чат'}</span>
          </button>

          {chatMenu.peerId && (
            <button
              type="button"
              onClick={() => {
                openUserProfile(chatMenu.peerId!);
                setChatMenu(null);
              }}
            >
              <User size={15} />
              <span>Перейти в профиль</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              // @ts-ignore
              useAppStore.getState().clearChatMessages(chatMenu.chatId);
              setChatMenu(null);
            }}
          >
            <Trash2 size={15} />
            <span>Очистить историю</span>
          </button>

          {chatMenu.peerId && (
            <button
              type="button"
              className={styles.dangerItem}
              onClick={() => {
                blockUser(chatMenu.peerId!);
                setChatMenu(null);
              }}
            >
              <Ban size={15} />
              <span>Заблокировать</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
