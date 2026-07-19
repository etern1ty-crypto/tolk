import { motion } from 'framer-motion';
import { Hash, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchApi, useAppStore } from '../../store/appStore';
import type { User } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './SearchTab.module.css';

type SearchFilter = 'all' | 'people' | 'posts' | 'channels';

type PublicChannel = {
  id: string;
  type: string;
  title: string;
  description?: string;
  avatarRef?: string;
  memberCount?: number;
  joined?: boolean;
};

export function SearchTab() {
  const token = useAppStore((s) => s.token);
  const posts = useAppStore((s) => s.posts);
  const chats = useAppStore((s) => s.chats);
  const users = useAppStore((s) => s.users);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const setCommentPostId = useAppStore((s) => s.setCommentPostId);
  const joinChat = useAppStore((s) => s.joinChat);

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [people, setPeople] = useState<User[]>([]);
  const [publicChannels, setPublicChannels] = useState<PublicChannel[]>([]);

  const query = q.trim().toLowerCase();

  useEffect(() => {
    if (!token) return;
    const t = window.setTimeout(() => {
      const path = query
        ? `/channels?q=${encodeURIComponent(query)}`
        : '/channels';
      fetchApi(path, {}, token)
        .then((rows) => setPublicChannels(rows || []))
        .catch(() => setPublicChannels([]));
    }, query ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [token, query]);

  useEffect(() => {
    if (!query) {
      setPeople([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const results = await fetchApi(`/users?q=${encodeURIComponent(query)}`, {}, token);
        setPeople(results || []);
      } catch {
        setPeople([]);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, token]);

  const foundPosts = useMemo(() => {
    if (!query) return [];
    const list = posts.filter((p) => p.onWall);
    return list.filter((p) => p.text.toLowerCase().includes(query));
  }, [posts, query]);

  const myChannels = useMemo(() => {
    const list = chats.filter((c) => c.type === 'group' || c.type === 'channel');
    if (!query) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.preview || '').toLowerCase().includes(query)
    );
  }, [chats, query]);

  const discoverChannels = useMemo(() => {
    // API already filtered by q; show joined + not joined
    return publicChannels;
  }, [publicChannels]);

  const showPeople = filter === 'all' || filter === 'people';
  const showPosts = filter === 'all' || filter === 'posts';
  const showChannels = filter === 'all' || filter === 'channels';

  const hasPeople = showPeople && query && people.length > 0;
  const hasPosts = showPosts && query && foundPosts.length > 0;
  const hasChannels =
    showChannels && (myChannels.length > 0 || discoverChannels.length > 0);
  const empty = !hasPeople && !hasPosts && !hasChannels;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>Поиск</h1>
      </header>

      <div className={styles.searchWrap}>
        <Search
          size={iconProps.size.sm}
          className={styles.searchIcon}
          strokeWidth={iconProps.strokeWidth}
        />
        <input
          id="tolk-global-search"
          className={styles.search}
          type="search"
          placeholder="Друзья, посты, каналы"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className={styles.filters} role="tablist" aria-label="Тип поиска">
        {(
          [
            ['all', 'Всё'],
            ['people', 'Друзья'],
            ['posts', 'Посты'],
            ['channels', 'Каналы'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={filter === id ? styles.chipActive : styles.chip}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {empty ? (
          <p className={styles.empty}>
            {query
              ? 'Ничего не нашлось'
              : filter === 'channels'
                ? 'Пока нет каналов'
                : 'Начните вводить запрос или откройте «Каналы»'}
          </p>
        ) : (
          <>
            {hasPeople && (
              <section className={styles.section}>
                <h2>
                  <Users size={14} strokeWidth={iconProps.strokeWidth} />
                  Люди
                </h2>
                {people.map((u, i) => (
                  <motion.div
                    key={u.id}
                    className={styles.row}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.15) }}
                  >
                    <button
                      type="button"
                      className={styles.rowMain}
                      onClick={() => openUserProfile(u.id)}
                    >
                      <Avatar name={u.displayName} id={u.id} avatarUrl={u.avatarRef} size={44} online={u.online} />
                      <div className={styles.meta}>
                        <span className={styles.name}>{u.displayName}</span>
                        <span className={styles.sub}>
                          @{u.username}
                          {u.bio ? ` · ${u.bio}` : ''}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={styles.action}
                      onClick={() => startChatWithUser(u.id)}
                    >
                      Написать
                    </button>
                  </motion.div>
                ))}
              </section>
            )}

            {hasChannels && (
              <section className={styles.section}>
                <h2>
                  <Hash size={14} strokeWidth={iconProps.strokeWidth} />
                  Каналы и группы
                </h2>
                {myChannels.map((c, i) => (
                  <motion.button
                    key={c.id}
                    type="button"
                    className={styles.rowMain}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.15) }}
                    onClick={() => setActiveChat(c.id)}
                  >
                    <Avatar name={c.title} id={c.id} avatarUrl={c.avatarRef} size={44} />
                    <div className={styles.meta}>
                      <span className={styles.name}>{c.title}</span>
                      <span className={styles.sub}>
                        {c.type === 'channel' ? 'канал' : 'группа'}
                        {c.memberCount ? ` · ${c.memberCount}` : ''}
                        {c.preview ? ` · ${c.preview}` : ''}
                      </span>
                    </div>
                  </motion.button>
                ))}
                {discoverChannels.map((c, i) => (
                  <motion.div
                    key={c.id}
                    className={styles.row}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.15) }}
                  >
                    <button type="button" className={styles.rowMain} onClick={() => joinChat(c.id)}>
                      <Avatar name={c.title} id={c.id} avatarUrl={c.avatarRef} size={44} />
                      <div className={styles.meta}>
                        <span className={styles.name}>{c.title}</span>
                        <span className={styles.sub}>
                          канал · {c.memberCount ?? 0} подп.
                          {c.description ? ` · ${c.description}` : ''}
                        </span>
                      </div>
                    </button>
                    <button type="button" className={styles.action} onClick={() => joinChat(c.id)}>
                      Вступить
                    </button>
                  </motion.div>
                ))}
              </section>
            )}

            {hasPosts && (
              <section className={styles.section}>
                <h2>
                  <Search size={14} strokeWidth={iconProps.strokeWidth} />
                  Посты
                </h2>
                {foundPosts.map((p, i) => {
                  const author = users[p.authorId];
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      className={styles.postRow}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.15) }}
                      onClick={() => {
                        setMainTab('wall');
                        setCommentPostId(p.id);
                      }}
                    >
                      <Avatar name={author?.displayName ?? '?'} id={author?.id} avatarUrl={author?.avatarRef} size={36} />
                      <div className={styles.meta}>
                        <span className={styles.name}>
                          {author?.displayName ?? '…'}
                        </span>
                        <span className={styles.postText}>
                          {p.text || 'Медиа'}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
