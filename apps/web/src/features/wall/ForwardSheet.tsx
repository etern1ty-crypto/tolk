import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './ForwardSheet.module.css';

export function ForwardSheet() {
  const postId = useAppStore((s) => s.forwardPostId);
  const chats = useAppStore((s) => s.chats);
  const users = useAppStore((s) => s.users);
  const setForwardPostId = useAppStore((s) => s.setForwardPostId);
  const forwardPostToChat = useAppStore((s) => s.forwardPostToChat);

  if (!postId) return null;

  return (
    <div className={styles.overlay} onClick={() => setForwardPostId(null)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Переслать в чат</h3>
        <ul>
          {chats.map((c) => {
            const peer = c.peerId ? users[c.peerId] : null;
            const uname = peer?.username?.trim();
            return (
              <li key={c.id}>
                <button type="button" onClick={() => forwardPostToChat(postId, c.id)}>
                  <Avatar
                    name={c.title}
                    id={c.peerId || c.id}
                    avatarUrl={c.avatarRef || peer?.avatarRef}
                    size={40}
                    online={c.online}
                  />
                  <span className={styles.meta}>
                    <strong>{c.title}</strong>
                    {uname ? <em>@{uname}</em> : c.type !== 'dm' ? <em>{c.type === 'channel' ? 'канал' : 'группа'}</em> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className={styles.cancel} onClick={() => setForwardPostId(null)}>
          Отмена
        </button>
      </div>
    </div>
  );
}
