import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './CommentSheet.module.css';

export function CommentSheet() {
  const postId = useAppStore((s) => s.commentPostId);
  const posts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);
  const setCommentPostId = useAppStore((s) => s.setCommentPostId);
  const addComment = useAppStore((s) => s.addComment);
  const [text, setText] = useState('');

  const post = posts.find((p) => p.id === postId);

  useEffect(() => {
    if (!postId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommentPostId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [postId, setCommentPostId]);

  useEffect(() => {
    setText('');
  }, [postId]);

  if (!postId || !post) return null;

  return (
    <div className={styles.overlay} onClick={() => setCommentPostId(null)} role="presentation">
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Комментарии"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Комментарии</h3>
        <ul className={styles.list}>
          {post.comments.length === 0 && (
            <li className={styles.empty}>Пока нет комментариев</li>
          )}
          {post.comments.map((c) => (
            <li key={c.id}>
              <strong>{users[c.userId]?.displayName ?? '…'}</strong>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            addComment(post.id, text);
            setText('');
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Комментарий"
            autoFocus
          />
          <button type="submit" disabled={!text.trim()}>
            →
          </button>
        </form>
      </div>
    </div>
  );
}
