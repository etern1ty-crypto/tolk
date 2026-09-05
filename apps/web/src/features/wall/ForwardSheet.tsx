import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { Sheet } from '../../shared/ui/Sheet';
import styles from './ForwardSheet.module.css';

export function ForwardSheet() {
  const postId = useAppStore((s) => s.forwardPostId);
  const chats = useAppStore((s) => s.chats);
  const users = useAppStore((s) => s.users);
  const close = useAppStore((s) => s.setForwardPostId);
  const forward = useAppStore((s) => s.forwardPostToChat);
  const writable = chats.filter(
    (c) => c.type !== 'channel' || c.myRole === 'owner' || c.myRole === 'admin',
  );
  return (
    <Sheet open={Boolean(postId)} onClose={() => close(null)} title="Переслать в чат">
      <div className={styles.sheet}>
        {!writable.length && (
          <p className={styles.empty}>Нет чатов, в которые можно отправить пост.</p>
        )}
        <ul>
          {writable.map((c) => {
            const peer = c.peerId ? users[c.peerId] : null;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (postId) forward(postId, c.id);
                  }}
                >
                  <Avatar
                    name={c.title}
                    id={c.peerId || c.id}
                    avatarUrl={c.avatarRef || peer?.avatarRef}
                    size={40}
                    online={c.online}
                  />
                  <span className={styles.meta}>
                    <strong>{c.title}</strong>
                    {peer?.username && <em>@{peer.username}</em>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Sheet>
  );
}
