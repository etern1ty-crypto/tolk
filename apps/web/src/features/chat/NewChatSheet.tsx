import { useEffect, useState } from 'react';
import { useAppStore, fetchApi } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './NewChatSheet.module.css';
import type { User } from '../../shared/types';

export function NewChatSheet() {
  const open = useAppStore((s) => s.newChatOpen);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const token = useAppStore((s) => s.token);
  const chats = useAppStore((s) => s.chats);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  const createGroup = useAppStore((s) => s.createGroupChat);
  const createChannel = useAppStore((s) => s.createChannel);

  const [mode, setMode] = useState<'dm' | 'group' | 'channel'>('dm');
  const [q, setQ] = useState('');
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode('dm');
      setQ('');
      setList([]);
      setSelected([]);
      setTitle('');
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (!query) {
      setList([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results: User[] = await fetchApi(`/users?q=${encodeURIComponent(query)}`, {}, token);
        // No full people dump — only search hits. Prefer users without existing DM in DM mode.
        const dmPeerIds = new Set(
          chats.filter((c) => c.type === 'dm' && c.peerId).map((c) => c.peerId!)
        );
        setList(
          (results || []).filter((u) => {
            if (mode === 'dm' && dmPeerIds.has(u.id)) return true; // still show — opens existing
            return true;
          })
        );
      } catch (err) {
        console.error('Failed to search users:', err);
        setList([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [q, open, token, mode, chats]);

  if (!open) return null;

  const close = () => {
    setQ('');
    setSelected([]);
    setTitle('');
    setNewChatOpen(false);
  };

  const toggleSelect = (u: User) => {
    setSelected((prev) =>
      prev.some((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u]
    );
  };

  const submitGroupOrChannel = async () => {
    if (!title.trim() || creating) return;
    if (mode === 'group' && selected.length === 0) return;
    setCreating(true);
    try {
      if (mode === 'group') {
        await createGroup(title.trim(), selected.map((u) => u.id));
      } else {
        await createChannel(title.trim());
      }
      close();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={close}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Новый чат"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Новый чат</h3>
        <div className={styles.modeRow}>
          {(
            [
              ['dm', 'Личный'],
              ['group', 'Группа'],
              ['channel', 'Канал'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={mode === id ? styles.modeActive : styles.modeBtn}
              onClick={() => {
                setMode(id);
                setQ('');
                setList([]);
                setSelected([]);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {(mode === 'group' || mode === 'channel') && (
          <input
            className={styles.search}
            placeholder={mode === 'group' ? 'Название группы' : 'Название канала'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}

        {mode !== 'channel' && (
          <input
            className={styles.search}
            placeholder="Имя или @username"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus={mode === 'dm'}
          />
        )}

        {mode !== 'channel' && (
          <ul>
            {loading && <p className={styles.emptyPrompt}>Поиск…</p>}
            {!loading && !q.trim() && (
              <p className={styles.emptyPrompt}>
                {mode === 'dm'
                  ? 'Начните вводить имя или @username — список людей не показывается'
                  : 'Найдите участников по username'}
              </p>
            )}
            {!loading && q.trim() && list.length === 0 && (
              <p className={styles.emptyPrompt}>Пользователи не найдены</p>
            )}
            {!loading &&
              list.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'dm') {
                        startChatWithUser(u.id);
                        close();
                      } else {
                        toggleSelect(u);
                      }
                    }}
                  >
                    <Avatar name={u.displayName} id={u.id} avatarUrl={u.avatarRef} size={36} online={u.online} />
                    <span>
                      <strong>{u.displayName}</strong>
                      <em>@{u.username}</em>
                      {mode === 'group' && selected.some((x) => x.id === u.id) ? ' · ✓' : ''}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}

        {mode === 'group' && selected.length > 0 && (
          <p className={styles.emptyPrompt}>Выбрано: {selected.map((u) => u.displayName).join(', ')}</p>
        )}

        {(mode === 'group' || mode === 'channel') && (
          <button
            type="button"
            className={styles.createBtn}
            disabled={
              creating ||
              !title.trim() ||
              (mode === 'group' && selected.length === 0)
            }
            onClick={() => void submitGroupOrChannel()}
          >
            {creating ? 'Создание…' : mode === 'group' ? 'Создать группу' : 'Создать канал'}
          </button>
        )}

        <button type="button" className={styles.cancel} onClick={close}>
          Отмена
        </button>
      </div>
    </div>
  );
}
