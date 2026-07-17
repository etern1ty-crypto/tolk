import { useEffect, useState } from 'react';
import { useAppStore, fetchApi } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './NewChatSheet.module.css';
import type { User } from '../../shared/types';

export function NewChatSheet() {
  const open = useAppStore((s) => s.newChatOpen);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const token = useAppStore((s) => s.token);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  
  const [q, setQ] = useState('');
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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
        const results = await fetchApi(`/users?q=${encodeURIComponent(query)}`, {}, token);
        setList(results || []);
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [q, open, token]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => {
        setQ('');
        setNewChatOpen(false);
      }}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Новый чат"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Новый чат</h3>
        <input
          className={styles.search}
          placeholder="Имя или @username"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        <ul>
          {loading && <p className={styles.emptyPrompt}>Поиск…</p>}
          {!loading && !q.trim() && <p className={styles.emptyPrompt}>Начните вводить имя или @username</p>}
          {!loading && q.trim() && list.length === 0 && <p className={styles.emptyPrompt}>Пользователи не найдены</p>}
          {!loading && list.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => {
                  startChatWithUser(u.id);
                  setQ('');
                  setNewChatOpen(false);
                }}
              >
                <Avatar name={u.displayName} id={u.id} avatarUrl={u.avatarRef} size={36} online={u.online} />
                <span>
                  <strong>{u.displayName}</strong>
                  <em>@{u.username}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => {
            setQ('');
            setNewChatOpen(false);
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
