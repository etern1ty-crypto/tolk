import { motion } from 'framer-motion';
import { PenSquare, Search, Wifi, WifiOff } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatList.module.css';

export function ChatList() {
  const chats = useAppStore((s) => s.chats);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const navPins = useAppStore((s) => s.navPins);
  const toggleNavPin = useAppStore((s) => s.toggleNavPin);
  const isOffline = useAppStore((s) => s.isOffline);
  const toggleOffline = useAppStore((s) => s.toggleOffline);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = [...chats].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
    );
  }, [chats, searchQuery]);

  return (
    <section className={styles.root} aria-label="Список чатов">
      <header className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
        <IconBtn
          onClick={toggleOffline}
          title={isOffline ? 'Offline' : 'Online'}
          aria-label="Сеть"
        >
          {isOffline ? (
            <WifiOff size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          ) : (
            <Wifi size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
          )}
        </IconBtn>
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
        />
      </div>

      <div className={styles.list}>
        {filtered.map((chat, i) => (
          <motion.div
            key={chat.id}
            className={`${styles.row} ${activeChatId === chat.id ? styles.rowActive : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.28 }}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleNavPin(chat.id);
            }}
            title="ПКМ — закрепить в боковой панели"
          >
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => chat.peerId && openUserProfile(chat.peerId)}
              aria-label={`Профиль ${chat.title}`}
            >
              <Avatar name={chat.title} id={chat.id} avatarUrl={chat.avatarRef} online={chat.online} size={48} />
            </button>
            <button
              type="button"
              className={styles.rowMain}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className={styles.meta}>
                <div className={styles.rowTop}>
                  <span className={styles.name}>
                    {(chat.pinned || navPins.includes(chat.id)) && (
                      <span className={styles.pin}>📌</span>
                    )}
                    {chat.title}
                    {chat.muted && <span className={styles.muted}>muted</span>}
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
        ))}
      </div>

      <motion.button
        type="button"
        className={styles.fab}
        onClick={() => setNewChatOpen(true)}
        aria-label="Новый чат"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <PenSquare size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
      </motion.button>
    </section>
  );
}
