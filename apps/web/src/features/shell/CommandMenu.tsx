import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { MessageCircle, Newspaper, Search, Settings, SquarePen, User, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import styles from './CommandMenu.module.css';

export function CommandMenu() {
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const chats = useAppStore((s) => s.chats);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const newChat = useAppStore((s) => s.setNewChatOpen);
  const settings = useAppStore((s) => s.openSettings);
  useEffect(() => {
    if (!desktop) {
      setOpen(false);
      return;
    }
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !e.isComposing) {
        if (document.querySelector('[aria-modal="true"]') && !open) return;
        e.preventDefault();
        setOpen((value) => !value);
      }
    };
    const show = () => setOpen(true);
    window.addEventListener('keydown', key);
    window.addEventListener('tolk:command-menu', show);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('tolk:command-menu', show);
    };
  }, [desktop, open]);
  if (!desktop) return null;
  const run = (action: () => unknown) => {
    setOpen(false);
    void action();
  };
  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Быстрый переход"
      loop
      className={styles.dialog}
      overlayClassName={styles.overlay}
    >
      <div className={styles.searchRow}>
        <Search size={20} />
        <Command.Input
          placeholder="Найти чат или действие…"
          aria-label="Найти чат или действие"
          maxLength={120}
        />
        <button type="button" aria-label="Закрыть быстрый переход" onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <Command.List className={styles.list}>
        <Command.Empty className={styles.empty}>Ничего не найдено</Command.Empty>
        <Command.Group heading="Действия">
          <Command.Item value="Новый чат" onSelect={() => run(() => newChat(true))}>
            <SquarePen size={18} />
            Новый чат
          </Command.Item>
          <Command.Item value="Настройки" onSelect={() => run(settings)}>
            <Settings size={18} />
            Настройки
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Разделы">
          <Command.Item value="Чаты" onSelect={() => run(() => setMainTab('chats'))}>
            <MessageCircle size={18} />
            Чаты
          </Command.Item>
          <Command.Item value="Стена лента" onSelect={() => run(() => setMainTab('wall'))}>
            <Newspaper size={18} />
            Стена
          </Command.Item>
          <Command.Item
            value="Поиск людей и сообщений"
            onSelect={() => run(() => setMainTab('search'))}
          >
            <Search size={18} />
            Поиск
          </Command.Item>
          <Command.Item value="Мой профиль" onSelect={() => run(() => setMainTab('profile'))}>
            <User size={18} />
            Мой профиль
          </Command.Item>
        </Command.Group>
        {!!chats.length && (
          <Command.Group heading="Ваши чаты">
            {chats.map((chat) => (
              <Command.Item
                key={chat.id}
                value={`${chat.title} ${chat.id}`}
                onSelect={() => run(() => setActiveChat(chat.id))}
              >
                <MessageCircle size={18} />
                <span>{chat.title}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
      <div className={styles.hint}>↑ ↓ выбрать · Enter открыть · Esc закрыть</div>
    </Command.Dialog>
  );
}
