import { PenSquare, Pin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatList.module.css';
import { createShareUrl } from '../../shared/lib/share';
import { SkeletonList } from '../../shared/ui/Skeleton';

export function ChatList() {
  const chats = useAppStore((s) => s.chats);
  const me = useAppStore((s) => s.me);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const [inviting, setInviting] = useState(false);
  const booting = useAppStore((s) => s.booting);

  // Единственный работающий механизм роста: дать человеку ссылку на себя,
  // чтобы позвать первого собеседника прямо отсюда.
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
        {filtered.length === 0 && booting && <SkeletonList count={6} kind="chat" />}
        {filtered.length === 0 && !booting &&
          (searchQuery.trim() ? (
            // Раньше поиск с опечаткой показывал «Напишите кому-нибудь» —
            // приложение советовало заводить друзей в ответ на промах в букве.
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Ничего не нашлось</p>
              <p className={styles.emptySub}>Попробуйте другое имя</p>
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Напишите первым</p>
              <p className={styles.emptySub}>
                Мессенджер начинается со второго человека
              </p>
              <div className={styles.emptyActions}>
                {/* Список людей мы намеренно не показываем, поэтому «найти
                    людей» через поиск по имени — тупик для того, кто ещё
                    никого здесь не знает. Живые люди есть на стене: оттуда
                    открывается профиль, а из профиля — переписка. */}
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
          ))}
        {filtered.map((chat) => {
          const isPinned = chat.pinned || navPins.includes(chat.id);
          return (
            <div
              key={chat.id}
              className={`${styles.row} ${activeChatId === chat.id ? styles.rowActive : ''}`}
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
