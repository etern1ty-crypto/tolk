import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './AuthScreen.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const OAUTH_PROVIDER_KEY = 'tolk_oauth_provider';

function oauthConfigured(provider: 'yandex' | 'vk'): boolean {
  if (provider === 'yandex') return Boolean(import.meta.env.VITE_YANDEX_CLIENT_ID);
  return Boolean(import.meta.env.VITE_VK_CLIENT_ID);
}

export function AuthScreen() {
  const authMode = useAppStore((s) => s.authMode);
  const setAuthMode = useAppStore((s) => s.setAuthMode);
  const draftUsername = useAppStore((s) => s.draftUsername);
  const draftName = useAppStore((s) => s.draftName);
  const draftPassword = useAppStore((s) => s.draftPassword);
  const setDraftUsername = useAppStore((s) => s.setDraftUsername);
  const setDraftName = useAppStore((s) => s.setDraftName);
  const setDraftPassword = useAppStore((s) => s.setDraftPassword);
  const register = useAppStore((s) => s.registerWithPassword);
  const login = useAppStore((s) => s.loginWithPassword);
  const loginWithYandex = useAppStore((s) => s.loginWithYandex);
  const loginWithVK = useAppStore((s) => s.loginWithVK);
  const completeSocialProfile = useAppStore((s) => s.completeSocialProfile);
  const cancelSocialProfile = useAppStore((s) => s.cancelSocialProfile);
  const socialPending = useAppStore((s) => s.socialPending);

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBusy, setOauthBusy] = useState(false);

  const isRegister = authMode === 'register';
  const isSocialProfile = authMode === 'social_profile';

  // OAuth redirect callback: #access_token=...&user_id=... (VK) or without user_id (Yandex)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const accessToken = params.get('access_token');
    const err = params.get('error_description') || params.get('error');

    // Clean URL immediately (token must not stay in history)
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (err) {
      setError(String(err));
      try {
        sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    if (!accessToken) return;

    let provider = (sessionStorage.getItem(OAUTH_PROVIDER_KEY) || '') as 'yandex' | 'vk' | '';
    try {
      sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
    } catch {
      /* ignore */
    }

    // Fallback: VK implicit often includes user_id
    if (!provider) {
      provider = params.has('user_id') ? 'vk' : 'yandex';
    }

    setOauthBusy(true);
    setError(null);
    const run = provider === 'vk' ? loginWithVK(accessToken) : loginWithYandex(accessToken);
    void run
      .catch((e: any) => setError(e?.message || 'Ошибка входа'))
      .finally(() => setOauthBusy(false));
  }, [loginWithVK, loginWithYandex]);

  const startYandex = () => {
    setError(null);
    const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError(
        'Яндекс ID не настроен (VITE_YANDEX_CLIENT_ID). Войдите по username/паролю или попросите админа добавить ключи.'
      );
      return;
    }
    try {
      sessionStorage.setItem(OAUTH_PROVIDER_KEY, 'yandex');
    } catch {
      /* ignore */
    }
    const redirectUri = window.location.origin;
    const url =
      `https://oauth.yandex.ru/authorize?response_type=token` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const startVK = () => {
    setError(null);
    const clientId = import.meta.env.VITE_VK_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError(
        'VK ID не настроен (VITE_VK_CLIENT_ID). Войдите по username/паролю или попросите админа добавить ключи.'
      );
      return;
    }
    try {
      sessionStorage.setItem(OAUTH_PROVIDER_KEY, 'vk');
    } catch {
      /* ignore */
    }
    const redirectUri = window.location.origin;
    const url =
      `https://oauth.vk.com/authorize?client_id=${encodeURIComponent(clientId)}` +
      `&display=page&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=offline&response_type=token&v=5.131`;
    window.location.href = url;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSocialProfile) {
        await completeSocialProfile();
      } else if (isRegister) {
        await register();
      } else {
        await login();
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const providerLabel =
    socialPending?.provider === 'vk'
      ? 'VK'
      : socialPending?.provider === 'yandex'
        ? 'Яндекс'
        : 'соцсеть';

  return (
    <div className={styles.root}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>Т</div>
          <h1>Толк.</h1>
          <p className={styles.tagline}>
            {isSocialProfile
              ? `Почти готово · ${providerLabel}`
              : 'Быстрый · чистый · свой'}
          </p>
        </div>

        {!isSocialProfile && (
          <div className={styles.toggle}>
            <button
              type="button"
              className={authMode === 'login' ? styles.toggleActive : styles.toggleInactive}
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
            >
              Войти
            </button>
            <button
              type="button"
              className={authMode === 'register' ? styles.toggleActive : styles.toggleInactive}
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
            >
              Регистрация
            </button>
          </div>
        )}

        {isSocialProfile && (
          <p className={styles.socialHint}>
            Придумайте, как вас будут видеть в Толке. Никаких авто-имён вроде «yandex_…» —
            только ваше имя и username.
          </p>
        )}

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {oauthBusy && (
          <div className={styles.oauthBusy}>Завершаем вход…</div>
        )}

        <form className={styles.form} onSubmit={submit} autoComplete="on">
          {(isRegister || isSocialProfile) && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">
                Имя
              </label>
              <input
                id="firstName"
                className={styles.input}
                type="text"
                placeholder="Как вас зовут?"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoComplete="name"
                maxLength={64}
                required
                autoFocus={isSocialProfile}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Имя пользователя
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              placeholder={isRegister || isSocialProfile ? 'username (3–30, a–z, 0–9, _)' : 'username'}
              value={draftUsername}
              onChange={(e) =>
                setDraftUsername(
                  e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30)
                )
              }
              autoComplete="username"
              spellCheck={false}
              required
              autoFocus={!isRegister && !isSocialProfile}
            />
            {(isRegister || isSocialProfile) && draftUsername && !USERNAME_RE.test(draftUsername) && (
              <span className={styles.fieldHint}>3–30 символов: латиница, цифры, _</span>
            )}
          </div>

          {!isSocialProfile && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Пароль
              </label>
              <div className={styles.pwWrap}>
                <input
                  id="password"
                  className={`${styles.input} ${styles.pwInput}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder={isRegister ? 'Минимум 8 символов' : '••••••'}
                  value={draftPassword}
                  onChange={(e) => setDraftPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={isRegister ? 8 : 1}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Скрыть' : 'Показать'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.primary}
            disabled={loading || oauthBusy}
          >
            {loading
              ? isSocialProfile
                ? 'Сохраняем…'
                : isRegister
                  ? 'Создаём…'
                  : 'Входим…'
              : isSocialProfile
                ? 'Продолжить'
                : isRegister
                  ? 'Создать аккаунт'
                  : 'Войти'}
          </button>

          {isSocialProfile && (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                cancelSocialProfile();
                setError(null);
              }}
              disabled={loading}
            >
              Отмена
            </button>
          )}
        </form>

        {!isSocialProfile &&
          (oauthConfigured('yandex') || oauthConfigured('vk')) && (
          <>
            <div className={styles.divider}>
              <span>или</span>
            </div>

            <div className={styles.oauthButtons}>
              {oauthConfigured('yandex') && (
                <button
                  type="button"
                  className={styles.yandexBtn}
                  onClick={startYandex}
                  disabled={loading || oauthBusy}
                >
                  <span className={styles.yandexIcon}>Я</span>
                  Войти через Яндекс
                </button>
              )}
              {oauthConfigured('vk') && (
                <button
                  type="button"
                  className={styles.vkBtn}
                  onClick={startVK}
                  disabled={loading || oauthBusy}
                >
                  <span className={styles.vkIcon}>VK</span>
                  Войти через VK
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
