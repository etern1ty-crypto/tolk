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
import { useAppStore, CHAT_THEMES, REACTION_SET } from '../../store/appStore';
import { soundEffects } from '../../shared/soundEffects';
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

  // Customization selectors & actions
  const globalChatThemeId = useAppStore((s) => s.globalChatThemeId);
  const notificationSound = useAppStore((s) => s.notificationSound);
  const soundVolume = useAppStore((s) => s.soundVolume);
  const browserNotificationsEnabled = useAppStore((s) => s.browserNotificationsEnabled);
  const defaultReaction = useAppStore((s) => s.defaultReaction);

  const setGlobalChatTheme = useAppStore((s) => s.setGlobalChatTheme);
  const setNotificationSound = useAppStore((s) => s.setNotificationSound);
  const setSoundVolume = useAppStore((s) => s.setSoundVolume);
  const setBrowserNotificationsEnabled = useAppStore((s) => s.setBrowserNotificationsEnabled);
  const setDefaultReaction = useAppStore((s) => s.setDefaultReaction);

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
                    <Avatar name={me.displayName} id={me.id} avatarUrl={me.avatarRef} size={52} />
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
                <div className={styles.stack}>
                  <div className={styles.sectionTitle}>Фон чата по умолчанию</div>
                  <div className={styles.themeGrid}>
                    {CHAT_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`${styles.themeCard} ${globalChatThemeId === theme.id ? styles.themeCardActive : ''}`}
                        onClick={() => setGlobalChatTheme(theme.id)}
                        style={{ background: theme.base }}
                      >
                        <span className={styles.themeLabel}>{theme.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.sectionTitle}>Звуки и уведомления</div>
                  
                  <div className={styles.rowFlex}>
                    <span className={styles.rowLabel} style={{ textTransform: 'none', fontSize: '13px', color: 'var(--text-primary)' }}>
                      Уведомления в браузере
                    </span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={browserNotificationsEnabled}
                        onChange={(e) => setBrowserNotificationsEnabled(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.rowFlex}>
                    <span className={styles.rowLabel} style={{ textTransform: 'none', fontSize: '13px', color: 'var(--text-primary)' }}>
                      Звук уведомлений
                    </span>
                    <select
                      value={notificationSound}
                      onChange={(e) => {
                        const val = e.target.value as 'pixel' | 'bubble' | 'silent';
                        setNotificationSound(val);
                        if (val === 'pixel') soundEffects.playPixelPush();
                        else if (val === 'bubble') soundEffects.playReceivedSoft();
                      }}
                      className={styles.select}
                    >
                      <option value="pixel">Google Pixel Chime</option>
                      <option value="bubble">Soft Bubble Pop</option>
                      <option value="silent">Без звука</option>
                    </select>
                  </div>

                  {notificationSound !== 'silent' && (
                    <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Громкость звука</span>
                        <span>{Math.round(soundVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className={styles.volumeSlider}
                      />
                    </div>
                  )}

                  <div className={styles.divider} />

                  <div className={styles.sectionTitle}>Реакция по умолчанию</div>
                  <div className={styles.reactionRow}>
                    {REACTION_SET.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`${styles.reactionBtn} ${defaultReaction === emoji ? styles.reactionBtnActive : ''}`}
                        onClick={() => setDefaultReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
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
