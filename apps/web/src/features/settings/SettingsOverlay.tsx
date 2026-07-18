import { AnimatePresence, motion } from 'framer-motion';
import { Upload, ChevronLeft, HardDrive, Info, LogOut, MessageSquare, MonitorSmartphone, Palette, Shield, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppStore, CHAT_THEMES, REACTION_SET, fetchApi } from '../../store/appStore';
import { soundEffects } from '../../shared/soundEffects';
import type { SettingsRoute } from '../../shared/types';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { PatternBg } from '../../shared/ui/PatternBg';
import styles from './SettingsOverlay.module.css';
import imageCompression from 'browser-image-compression';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

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
  const notifPrefs = useAppStore((s) => s.notifPrefs);
  const setNotifPref = useAppStore((s) => s.setNotifPref);

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

              {route === 'account' && <AccountEditor />}

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
                      >
                        <PatternBg pattern={theme} seed={theme.id} density="low" className={styles.themePreviewBg} />
                        <span className={styles.themeLabel}>{theme.label}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`${styles.themeCard} ${useAppStore.getState().globalCustomWallpaper ? styles.themeCardActive : ''}`}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const compressed = await imageCompression(file, {
                              maxSizeMB: 0.5,
                              maxWidthOrHeight: 1920,
                              fileType: 'image/webp',
                              initialQuality: 0.8,
                            });
                            const token = useAppStore.getState().token;
                            const uploadRes = await fetchApi('/media/uploads', {
                              method: 'POST',
                              body: JSON.stringify({
                                mime: 'image/webp',
                                size: compressed.size,
                                kind: 'image',
                              }),
                            }, token);
                            await fetch(uploadRes.upload_url, {
                              method: 'PUT',
                              body: compressed,
                              headers: { 'Content-Type': 'image/webp' },
                            });
                            await fetchApi(`/media/${uploadRes.media_id}/complete`, { method: 'POST' }, token);
                            useAppStore.getState().setGlobalCustomWallpaper(uploadRes.public_url);
                          } catch (err) {
                            useAppStore.getState().showToast('Ошибка загрузки обоев');
                          }
                        };
                        input.click();
                      }}
                    >
                      <div className={styles.themePreviewBg} style={{ background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={20} />
                      </div>
                      <span className={styles.themeLabel}>Своё</span>
                    </button>
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

                  <div className={styles.divider} />
                  <div className={styles.sectionTitle}>Триггеры уведомлений</div>
                  {(
                    [
                      ['messages', 'Новые сообщения'],
                      ['comments', 'Комментарии'],
                      ['likes', 'Лайки'],
                      ['posts', 'Новые посты'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className={styles.rowFlex}>
                      <span className={styles.rowLabel} style={{ textTransform: 'none', fontSize: '13px', color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={notifPrefs?.[key] ?? true}
                          onChange={(e) => setNotifPref(key, e.target.checked)}
                        />
                        <span className={styles.slider} />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {route === 'sessions' && (
                <div className={styles.stack}>
                  <div className={styles.session}>
                    <strong>Этот браузер</strong>
                    <span className={styles.navSub}>Активна · web · текущая сессия</span>
                  </div>
                  <p className={styles.note}>
                    Завершить другие устройства можно будет после синка списка сессий с API.
                    Сейчас выход из аккаунта сбрасывает только этот клиент.
                  </p>
                  <button
                    type="button"
                    className={styles.logout}
                    onClick={() => {
                      if (window.confirm('Выйти из аккаунта на этом устройстве?')) logout();
                    }}
                  >
                    <LogOut size={16} />
                    Выйти здесь
                  </button>
                </div>
              )}

              {route === 'appearance' && (
                <div className={styles.stack}>
                  <div className={styles.sectionTitle}>Тема</div>
                  <Row label="Режим" value="Тёмная (системная для Толк.)" />
                  <p className={styles.note}>
                    Фон профиля и баннер — на вкладке <strong>Профиль</strong>. Фон чата — в
                    «Чаты» / ⋯ → Оформление внутри диалога.
                  </p>
                  <div className={styles.sectionTitle}>Интерфейс</div>
                  <Row label="Иконки" value="lucide · stroke 1.75" />
                  <Row label="Шрифт" value="Inter / system" />
                </div>
              )}

              {route === 'privacy' && (
                <div className={styles.stack}>
                  <div className={styles.sectionTitle}>Видимость</div>
                  <Row label="Стена" value="Видна подписчикам / в ленте (MVP)" />
                  <Row label="Last seen" value="Показывается контактам" />
                  <Row label="Онлайн" value="Зелёная точка в аватаре" />
                  <p className={styles.note}>
                    Гранулярные правила «кто видит last seen / стену» — следующие итерации.
                    Блокировка и жалобы — через профиль пира (скоро).
                  </p>
                </div>
              )}

              {route === 'storage' && (
                <div className={styles.stack}>
                  <div className={styles.sectionTitle}>Данные</div>
                  <Row label="Медиа" value="Кэш браузера + серверные uploads" />
                  <Row label="Локальный стейт" value="localStorage · tolk-web-state" />
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => {
                      if (window.confirm('Очистить кэш приложения в этом браузере? (не удаляет аккаунт)')) {
                        try {
                          localStorage.removeItem('tolk-web-state');
                          useAppStore.getState().showToast('Кэш очищен — перезагрузите страницу');
                        } catch {
                          useAppStore.getState().showToast('Не удалось очистить');
                        }
                      }
                    }}
                  >
                    Очистить локальный кэш
                  </button>
                </div>
              )}

              {route === 'about' && (
                <div className={styles.stack}>
                  <p className={styles.note}>
                    <strong>Толк.</strong> — чаты · стена · профиль. Web MVP.
                  </p>
                  <Row label="Клиент" value="apps/web · React + Vite" />
                  <Row label="Версия" value="0.1.0" />
                </div>
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

function AccountEditor() {
  const me = useAppStore((s) => s.me);
  const token = useAppStore((s) => s.token);
  const updateMe = useAppStore((s) => s.updateMe);

  const [displayName, setDisplayName] = useState(me.displayName);
  const [username, setUsername] = useState(me.username);
  const [bio, setBio] = useState(me.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid' | 'self'>('idle');

  useEffect(() => {
    setDisplayName(me.displayName);
    setUsername(me.username);
    setBio(me.bio ?? '');
  }, [me.id, me.displayName, me.username, me.bio]);

  useEffect(() => {
    const cleaned = username.trim().toLowerCase();
    if (cleaned === me.username.toLowerCase()) {
      setAvailability('self');
      return;
    }
    if (!USERNAME_RE.test(cleaned)) {
      setAvailability(cleaned.length === 0 ? 'idle' : 'invalid');
      return;
    }
    setAvailability('checking');
    const t = window.setTimeout(async () => {
      try {
        const res = await fetchApi(
          `/users/username-available?u=${encodeURIComponent(cleaned)}`,
          {},
          token
        );
        setAvailability(res.available ? 'ok' : res.reason === 'invalid' ? 'invalid' : 'taken');
      } catch {
        setAvailability('idle');
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [username, me.username, token]);

  const usernameOk = availability === 'ok' || availability === 'self';
  const nameOk = displayName.trim().length >= 1;
  const dirty =
    displayName.trim() !== me.displayName ||
    username.trim().toLowerCase() !== me.username.toLowerCase() ||
    (bio.trim() || '') !== (me.bio ?? '');

  const save = async () => {
    if (!nameOk || !usernameOk || !dirty) return;
    setSaving(true);
    try {
      const patch: { displayName?: string; username?: string; bio?: string } = {};
      if (displayName.trim() !== me.displayName) patch.displayName = displayName.trim();
      if (username.trim().toLowerCase() !== me.username.toLowerCase()) {
        patch.username = username.trim().toLowerCase();
      }
      if ((bio.trim() || '') !== (me.bio ?? '')) patch.bio = bio.trim();
      await updateMe(patch);
    } catch {
      /* toast from store */
    } finally {
      setSaving(false);
    }
  };

  const availLabel =
    availability === 'checking'
      ? 'Проверяем…'
      : availability === 'ok'
        ? 'Свободен'
        : availability === 'taken'
          ? 'Занят'
          : availability === 'invalid'
            ? '3–30: a-z, 0-9, _'
            : availability === 'self'
              ? 'Ваш текущий'
              : '';

  return (
    <div className={styles.stack}>
      <label className={styles.field}>
        <span className={styles.rowLabel}>Имя</span>
        <input
          className={styles.fieldInput}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={64}
          placeholder="Отображаемое имя"
        />
      </label>
      <label className={styles.field}>
        <span className={styles.rowLabel}>Username</span>
        <div className={styles.usernameRow}>
          <span className={styles.at}>@</span>
          <input
            className={styles.fieldInput}
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            maxLength={30}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="username"
          />
        </div>
        {availLabel && (
          <span
            className={
              availability === 'ok' || availability === 'self'
                ? styles.availOk
                : availability === 'checking'
                  ? styles.availMuted
                  : styles.availBad
            }
          >
            {availLabel}
          </span>
        )}
      </label>
      <label className={styles.field}>
        <span className={styles.rowLabel}>Био</span>
        <textarea
          className={styles.fieldTextarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="О себе"
        />
      </label>
      <Row label="Телефон" value={me.phone ?? '—'} />
      <button
        type="button"
        className={styles.saveBtn}
        disabled={!dirty || !nameOk || !usernameOk || saving}
        onClick={() => void save()}
      >
        {saving ? 'Сохранение…' : 'Сохранить'}
      </button>
    </div>
  );
}
