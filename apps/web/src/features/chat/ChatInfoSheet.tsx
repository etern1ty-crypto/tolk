import { Link2, LogOut, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi, useAppStore } from '../../store/appStore';
import { copyShareLink } from '../../shared/lib/share';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './ChatInfoSheet.module.css';

type Member = {
  id: string;
  username: string;
  displayName: string;
  avatarRef?: string;
  role: string;
};

export function ChatInfoSheet() {
  const open = useAppStore((s) => s.chatInfoOpen);
  const setChatInfoOpen = useAppStore((s) => s.setChatInfoOpen);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const chats = useAppStore((s) => s.chats);
  const token = useAppStore((s) => s.token);
  const showToast = useAppStore((s) => s.showToast);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const leaveChat = useAppStore((s) => s.leaveChat);
  const updateChatMeta = useAppStore((s) => s.updateChatMeta);

  const chat = chats.find((c) => c.id === activeChatId);
  const [members, setMembers] = useState<Member[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !activeChatId || !chat) return;
    setTitle(chat.title);
    setDescription(chat.description || '');
    setIsPublic(chat.isPublic !== false);
    fetchApi(`/chats/${activeChatId}/members`, {}, token)
      .then((rows) => setMembers(rows || []))
      .catch(() => setMembers([]));
  }, [open, activeChatId, chat?.id, token]);

  if (!open || !chat || chat.type === 'dm') return null;

  const isAdmin = chat.myRole === 'owner' || chat.myRole === 'admin';
  const kind = chat.type === 'channel' ? 'channel' : 'group';

  return (
    <div className={styles.overlay} onClick={() => setChatInfoOpen(false)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <header className={styles.head}>
          <h3>{chat.type === 'channel' ? 'Канал' : 'Группа'}</h3>
          <button type="button" onClick={() => setChatInfoOpen(false)} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>

        <div className={styles.hero}>
          <Avatar name={chat.title} id={chat.id} avatarUrl={chat.avatarRef} size={64} />
          {isAdmin ? (
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={128}
            />
          ) : (
            <h4>{chat.title}</h4>
          )}
          <p className={styles.meta}>
            <Users size={14} /> {chat.memberCount ?? members.length} участников
            {chat.isPublic ? ' · публичный' : ' · по ссылке'}
          </p>
        </div>

        {isAdmin && (
          <label className={styles.field}>
            <span>Описание</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="О канале / группе"
            />
          </label>
        )}

        {isAdmin && chat.type === 'channel' && (
          <label className={styles.switchRow}>
            <span>Публичный канал</span>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </label>
        )}

        {isAdmin && (
          <button
            type="button"
            className={styles.primary}
            disabled={saving || !title.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                await updateChatMeta(chat.id, {
                  title: title.trim(),
                  description,
                  is_public: isPublic,
                });
                showToast('Сохранено');
              } catch {
                /* toast in store */
              } finally {
                setSaving(false);
              }
            }}
          >
            Сохранить
          </button>
        )}

        <button
          type="button"
          className={styles.secondary}
          onClick={async () => {
            try {
              const url = await copyShareLink(kind, chat.id, token);
              showToast(`Ссылка скопирована`);
              console.info(url);
            } catch (e: any) {
              showToast(e.message || 'Не удалось создать ссылку');
            }
          }}
        >
          <Link2 size={16} /> Скопировать ссылку
        </button>

        <h4 className={styles.section}>Участники</h4>
        <ul className={styles.members}>
          {members.map((m) => (
            <li key={m.id}>
              <Avatar name={m.displayName} id={m.id} avatarUrl={m.avatarRef} size={36} />
              <span>
                <strong>{m.displayName}</strong>
                <em>
                  @{m.username}
                  {m.role !== 'member' ? ` · ${m.role}` : ''}
                </em>
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.danger}
          onClick={async () => {
            const label = chat.type === 'channel' ? 'Отписаться от канала?' : 'Покинуть группу?';
            if (!window.confirm(label)) return;
            await leaveChat(chat.id);
            setChatInfoOpen(false);
            setActiveChat(null);
          }}
        >
          <LogOut size={16} />{' '}
          {chat.type === 'channel' ? 'Отписаться' : 'Выйти'}
        </button>
      </div>
    </div>
  );
}
