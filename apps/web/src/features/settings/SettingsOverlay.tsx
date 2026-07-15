import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  HardDrive,
  Info,
  LogOut,
  MessageSquare,
  MonitorSmartphone,
  Palette,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import type { SettingsRoute } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import styles from './SettingsOverlay.module.css';

type HubRoute = Exclude<NonNullable<SettingsRoute>, 'hub'>;

const HUB_ITEMS: {
  id: HubRoute;
  label: string;
  sub?: string;
  Icon: typeof User;
}[] = [
  { id: 'account', label: 'Аккаунт', sub: 'Имя и username', Icon: User },
  { id: 'chats', label: 'Чаты', sub: 'Реакции, войсы', Icon: MessageSquare },
  {
    id: 'sessions',
    label: 'Устройства',
    sub: 'Активные сессии',
    Icon: MonitorSmartphone,
  },
  { id: 'appearance', label: 'Оформление', Icon: Palette },
  { id: 'privacy', label: 'Приватность', Icon: Shield },
  { id: 'storage', label: 'Данные', Icon: HardDrive },
  { id: 'about', label: 'О приложении', Icon: Info },
];

export function SettingsOverlay() {
  const route = useAppStore((s) => s.settingsRoute);
  const me = useAppStore((s) => s.me);
  const closeSettings = useAppStore((s) => s.closeSettings);
  const navigateSettings = useAppStore((s) => s.navigateSettings);
  const setMainTab = useAppStore((s) => s.setMainTab);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!route) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (route === 'hub') closeSettings();
        else navigateSettings('hub');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route, closeSettings, navigateSettings]);

  const title =
    !route || route === 'hub'
      ? 'Настройки'
      : HUB_ITEMS.find((i) => i.id === route)?.label ?? 'Настройки';

  return (
    <AnimatePresence>
      {route && (
        <motion.div
          className={styles.overlay}
          role="presentation"
          onClick={closeSettings}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: 36, opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <header className={styles.header}>
              {route !== 'hub' ? (
                <IconBtn
                  onClick={() => navigateSettings('hub')}
                  aria-label="Назад"
                >
                  <ChevronLeft size={20} />
                </IconBtn>
              ) : (
                <span className={styles.backSpacer} />
              )}
              <h2 className={styles.title}>{title}</h2>
              <IconBtn onClick={closeSettings} aria-label="Закрыть">
                <X size={18} />
              </IconBtn>
            </header>

            <div className={styles.body}>
              {route === 'hub' && (
                <>
                  <button
                    type="button"
                    className={styles.profile}
                    onClick={() => {
                      closeSettings();
                      setMainTab('profile');
                    }}
                  >
                    <Avatar name={me.displayName} size={52} />
                    <div>
                      <div className={styles.name}>{me.displayName}</div>
                      <div className={styles.uname}>
                        @{me.username} · профиль
                      </div>
                    </div>
                  </button>
                  <nav className={styles.nav}>
                    {HUB_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={styles.navItem}
                        onClick={() => navigateSettings(item.id)}
                      >
                        <span className={styles.navIcon}>
                          <item.Icon size={18} strokeWidth={1.9} />
                        </span>
                        <span className={styles.navText}>
                          <span>{item.label}</span>
                          {item.sub && (
                            <span className={styles.navSub}>{item.sub}</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </nav>
                  <button
                    type="button"
                    className={styles.logout}
                    onClick={() => {
                      if (window.confirm('Выйти?')) logout();
                    }}
                  >
                    <LogOut size={16} />
                    Выйти
                  </button>
                </>
              )}

              {route === 'account' && (
                <div className={styles.stack}>
                  <Row label="Имя" value={me.displayName} />
                  <Row label="Username" value={`@${me.username}`} />
                  <Row label="Телефон" value={me.phone ?? '—'} />
                  <Row label="Био" value={me.bio ?? '—'} />
                </div>
              )}

              {route === 'chats' && (
                <p className={styles.note}>
                  Реакции, войсы и кружки — в диалоге. Эффекты кружков спрятаны
                  (кнопка ···).
                </p>
              )}

              {route === 'sessions' && (
                <div className={styles.stack}>
                  <div className={styles.session}>
                    <strong>Этот браузер</strong>
                    <span className={styles.navSub}>Активна · web</span>
                  </div>
                </div>
              )}

              {route === 'appearance' && (
                <p className={styles.note}>
                  Тёмная тема. Фон профиля — на вкладке Профиль.
                </p>
              )}

              {route === 'privacy' && (
                <p className={styles.note}>
                  Кто видит стену / last seen — soon.
                </p>
              )}

              {route === 'storage' && (
                <p className={styles.note}>Кэш медиа — soon.</p>
              )}

              {route === 'about' && (
                <p className={styles.note}>
                  <strong>Толк.</strong> — чаты · стена · профиль. Web MVP.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
