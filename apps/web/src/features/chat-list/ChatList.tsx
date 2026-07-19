import { motion } from 'framer-motion';
import { PenSquare, Pin, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatList.module.css';

export function ChatList() {
  const chats = useAppStore((s) => s.chats);
  const me = useAppStore((s) => s.me);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const navPins = useAppStore((s) => s.navPins);
  const toggleNavPin = useAppStore((s) => s.toggleNavPin);
  const isDesktop = useIsDesktop();

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

  return (
    <section className={styles.root} aria-label="Список чатов">
      <header className={styles.header}>
        {!isDesktop && (
          <button
            type="button"
            className={styles.meBtn}
            onClick={() => setMainTab('profile')}
            aria-label="Профиль"
          >
            <Avatar
              name={me.displayName}
              id={me.id}
              avatarUrl={me.avatarRef}
              size={36}
              online={me.online}
            />
          </button>
        )}
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
              title="Поиск"
            >
              <Search size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconAction}
            onClick={() => setNewChatOpen(true)}
            aria-label="Новый чат"
            title="Написать"
          >
            <PenSquare size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          </button>
        </div>
      </header>

      <div className={styles.searchWrap}>
        <Search
          size={iconProps.size.sm}
          className={styles.searchIcon}
          strokeWidth={iconProps.strokeWidth}
        />
        <input
          id="tolk-search"
          className={styles.search}
          type="search"
          placeholder="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Пусто</p>
            <p className={styles.emptySub}>Напишите кому-нибудь</p>
          </div>
        )}
        {filtered.map((chat, i) => {
          const isPinned = chat.pinned || navPins.includes(chat.id);
          return (
            <motion.div
              key={chat.id}
              className={`${styles.row} ${activeChatId === chat.id ? styles.rowActive : ''}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.15), duration: 0.22 }}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleNavPin(chat.id);
              }}
              title={isDesktop ? 'ПКМ — закрепить' : undefined}
            >
              <button
                type="button"
                className={styles.avatarBtn}
                onClick={() => chat.peerId && openUserProfile(chat.peerId)}
                aria-label={`Профиль ${chat.title}`}
              >
                <Avatar
                  name={chat.title}
                  id={chat.id}
                  avatarUrl={chat.avatarRef}
                  online={chat.online}
                  size={isDesktop ? 44 : 48}
                />
              </button>
              <button
                type="button"
                className={styles.rowMain}
                onClick={() => setActiveChat(chat.id)}
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
                      {chat.title}
                      {chat.muted && <span className={styles.muted}>тихий</span>}
                    </span>
                    <span className={styles.time}>{chat.timeLabel}</span>
                  </div>
                  <div className={styles.rowBottom}>
                    <span className={styles.preview}>{chat.preview}</span>
                    {chat.unread > 0 && (
                      <span className={styles.badge}>{chat.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
