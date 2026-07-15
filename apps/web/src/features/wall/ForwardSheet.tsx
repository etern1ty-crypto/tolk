import { useAppStore } from '../../store/appStore';
import styles from './ForwardSheet.module.css';

export function ForwardSheet() {
  const postId = useAppStore((s) => s.forwardPostId);
  const chats = useAppStore((s) => s.chats);
  const setForwardPostId = useAppStore((s) => s.setForwardPostId);
  const forwardPostToChat = useAppStore((s) => s.forwardPostToChat);

  if (!postId) return null;

  return (
    <div className={styles.overlay} onClick={() => setForwardPostId(null)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Переслать в чат</h3>
        <ul>
          {chats.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => forwardPostToChat(postId, c.id)}>
                {c.title}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.cancel} onClick={() => setForwardPostId(null)}>
          Отмена
        </button>
      </div>
    </div>
  );
}
