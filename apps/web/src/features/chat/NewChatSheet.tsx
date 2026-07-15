import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './NewChatSheet.module.css';

export function NewChatSheet() {
  const open = useAppStore((s) => s.newChatOpen);
  const setNewChatOpen = useAppStore((s) => s.setNewChatOpen);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const startChatWithUser = useAppStore((s) => s.startChatWithUser);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return Object.values(users)
      .filter((u) => u.id !== me.id)
      .filter(
        (u) =>
          !query ||
          u.displayName.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query)
      );
  }, [users, me.id, q]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => setNewChatOpen(false)}
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
          {list.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => {
                  startChatWithUser(u.id);
                  setNewChatOpen(false);
                }}
              >
                <span className={styles.av}>{u.displayName.charAt(0)}</span>
                <span>
                  <strong>{u.displayName}</strong>
                  <em>@{u.username}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.cancel} onClick={() => setNewChatOpen(false)}>
          Отмена
        </button>
      </div>
    </div>
  );
}
