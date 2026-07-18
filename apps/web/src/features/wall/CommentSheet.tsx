import { Heart, Reply } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Comment } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './CommentSheet.module.css';

function buildTree(comments: Comment[]) {
  const byParent = new Map<string | null, Comment[]>();
  for (const c of comments) {
    const key = c.parentId || null;
    const list = byParent.get(key) || [];
    list.push(c);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.createdAt - b.createdAt);
  }
  return byParent;
}

export function CommentSheet() {
  const postId = useAppStore((s) => s.commentPostId);
  const posts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const setCommentPostId = useAppStore((s) => s.setCommentPostId);
  const addComment = useAppStore((s) => s.addComment);
  const toggleCommentLike = useAppStore((s) => s.toggleCommentLike);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const post = posts.find((p) => p.id === postId);
  const tree = useMemo(() => buildTree(post?.comments || []), [post?.comments]);

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
    setReplyTo(null);
  }, [postId]);

  if (!postId || !post) return null;

  const renderNode = (c: Comment, depth: number) => {
    const user = users[c.userId];
    const name = user?.displayName ?? '…';
    const liked = (c.likedBy || []).includes(me.id);
    const kids = tree.get(c.id) || [];
    return (
      <li key={c.id} className={styles.commentRow} style={{ marginLeft: Math.min(depth, 6) * 14 }}>
        <Avatar name={name} id={user?.id ?? c.userId} avatarUrl={user?.avatarRef} size={depth ? 28 : 32} />
        <div className={styles.commentBody}>
          <strong>{name}</strong>
          <span>{c.text}</span>
          <div className={styles.commentActions}>
            <button
              type="button"
              className={liked ? styles.liked : ''}
              onClick={() => toggleCommentLike(post.id, c.id)}
            >
              <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
              {(c.likedBy || []).length || ''}
            </button>
            <button type="button" onClick={() => setReplyTo(c)}>
              <Reply size={13} /> Ответить
            </button>
          </div>
          {kids.length > 0 && (
            <ul className={styles.nested}>
              {kids.map((k) => renderNode(k, depth + 1))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  const roots = tree.get(null) || [];

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
          {roots.length === 0 && (
            <li className={styles.empty}>Пока нет комментариев</li>
          )}
          {roots.map((c) => renderNode(c, 0))}
        </ul>
        {replyTo && (
          <div className={styles.replyHint}>
            Ответ · {users[replyTo.userId]?.displayName ?? '…'}
            <button type="button" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            addComment(post.id, text, replyTo?.id);
            setText('');
            setReplyTo(null);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? 'Ответ…' : 'Комментарий'}
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
