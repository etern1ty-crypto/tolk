import { Heart, Reply, SendHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Comment } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { AutoTextarea } from '../../shared/ui/AutoTextarea';
import { Sheet } from '../../shared/ui/Sheet';
import styles from './CommentSheet.module.css';

function buildTree(comments: Comment[]) {
  const ids = new Set(comments.map((c) => c.id));
  const tree = new Map<string | null, Comment[]>();
  for (const c of comments) {
    const parent = c.parentId && ids.has(c.parentId) && c.parentId !== c.id ? c.parentId : null;
    const list = tree.get(parent) ?? [];
    list.push(c);
    tree.set(parent, list);
  }
  for (const list of tree.values()) list.sort((a, b) => a.createdAt - b.createdAt);
  return tree;
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
  const [sending, setSending] = useState(false);
  const post = posts.find((p) => p.id === postId);
  const tree = useMemo(() => buildTree(post?.comments ?? []), [post?.comments]);
  useEffect(() => {
    setText('');
    setReplyTo(null);
    setSending(false);
  }, [postId]);

  const renderNode = (c: Comment, depth: number, ancestors: Set<string>): React.ReactNode => {
    if (ancestors.has(c.id) || depth > 30) return null;
    const next = new Set(ancestors).add(c.id);
    const user = users[c.userId];
    const name = user?.displayName ?? 'Пользователь';
    const liked = (c.likedBy ?? []).includes(me.id);
    const kids = tree.get(c.id) ?? [];
    return (
      <li key={c.id} className={styles.commentRow}>
        <Avatar name={name} id={c.userId} avatarUrl={user?.avatarRef} size={depth ? 28 : 32} />
        <div className={styles.commentBody}>
          <strong>{name}</strong>
          <p>{c.text}</p>
          <div className={styles.commentActions}>
            <button
              type="button"
              className={liked ? styles.liked : ''}
              aria-pressed={liked}
              aria-label={liked ? 'Убрать отметку с комментария' : 'Нравится комментарий'}
              onClick={() => {
                if (postId) void toggleCommentLike(postId, c.id);
              }}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              {c.likedBy?.length || ''}
            </button>
            <button type="button" onClick={() => setReplyTo(c)}>
              <Reply size={16} /> Ответить
            </button>
          </div>
          {kids.length > 0 && (
            <ul className={styles.nested} style={{ marginLeft: depth < 2 ? 8 : 0 }}>
              {kids.map((k) => renderNode(k, depth + 1, next))}
            </ul>
          )}
        </div>
      </li>
    );
  };
  const roots = tree.get(null) ?? [];
  return (
    <Sheet open={Boolean(postId)} onClose={() => setCommentPostId(null)} title="Комментарии" wide>
      <div className={styles.body}>
        <ul className={styles.list} aria-label="Комментарии к посту">
          {!post && <li className={styles.empty}>Пост недоступен. Обновите ленту.</li>}
          {post && !roots.length && <li className={styles.empty}>Пока нет комментариев</li>}
          {roots.map((c) => renderNode(c, 0, new Set()))}
        </ul>
        {replyTo && (
          <div className={styles.replyHint}>
            <span>Ответ: {users[replyTo.userId]?.displayName ?? 'Пользователь'}</span>
            <button type="button" aria-label="Отменить ответ" onClick={() => setReplyTo(null)}>
              <X size={18} />
            </button>
          </div>
        )}
        <form
          className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!postId || !post || !text.trim() || sending) return;
            const draft = text;
            const id = postId;
            setSending(true);
            try {
              const saved = await addComment(id, draft, replyTo?.id);
              if (saved && useAppStore.getState().commentPostId === id) {
                setText((current) => (current === draft ? '' : current));
                setReplyTo(null);
              }
            } finally {
              setSending(false);
            }
          }}
        >
          <AutoTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={10000}
            placeholder={replyTo ? 'Ответ…' : 'Комментарий'}
            aria-label={replyTo ? 'Текст ответа' : 'Текст комментария'}
            disabled={!post}
          />
          <button
            type="submit"
            disabled={!post || !text.trim() || sending}
            aria-label="Отправить комментарий"
          >
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </Sheet>
  );
}
