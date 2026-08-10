import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Eye, EyeOff } from 'lucide-react';
import { Onboarding } from './Onboarding';
import styles from './AuthScreen.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const OAUTH_PROVIDER_KEY = 'tolk_oauth_provider';

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function getPasswordStrength(pw: string): { level: PasswordStrength; score: number; label: string } {
  if (!pw) return { level: 'weak', score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 'weak', score: 1, label: 'Слабый' };
  if (score === 2) return { level: 'fair', score: 2, label: 'Средний' };
  if (score === 3) return { level: 'good', score: 3, label: 'Хороший' };
  return { level: 'strong', score: 4, label: 'Надёжный' };
}

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

  /* ── Interactive Phone Onboarding Gate ── */
  const [showOnboarding, setShowOnboarding] = useState(true);

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const isRegister = authMode === 'register';
  const isSocialProfile = authMode === 'social_profile';

  const pwStrength = useMemo(() => getPasswordStrength(draftPassword), [draftPassword]);
  const usernameValid = USERNAME_RE.test(draftUsername);
  const showUsernameError = usernameTouched && draftUsername.length > 0 && !usernameValid;

  // OAuth redirect callback
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const accessToken = params.get('access_token');
    const err = params.get('error_description') || params.get('error');

    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (err) {
      setError(String(err));
      setShowOnboarding(false);
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

    if (!provider) {
      provider = params.has('user_id') ? 'vk' : 'yandex';
    }

    setShowOnboarding(false);
    setOauthBusy(true);
    setError(null);
    const run = provider === 'vk' ? loginWithVK(accessToken) : loginWithYandex(accessToken);
    void run
      .catch((e: any) => setError(e?.message || 'Ошибка входа'))
      .finally(() => setOauthBusy(false));
  }, [loginWithVK, loginWithYandex]);

  /* ── 1. Shows phone with chats, wall, profile preview tabs, hints, and "Далее / Пропустить" buttons ── */
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  const startYandex = () => {
    setError(null);
    const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError('Яндекс ID не настроен (VITE_YANDEX_CLIENT_ID). Войдите по логину и паролю.');
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
      setError('VK ID не настроен (VITE_VK_CLIENT_ID). Войдите по логину и паролю.');
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
      `&display=page` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSocialProfile) {
      if (!usernameValid) {
        setError('Имя пользователя: 3–30 символов, только латиница, цифры и _');
        return;
      }
      setLoading(true);
      try {
        await completeSocialProfile();
      } catch (err: any) {
        setError(err.message || 'Не удалось завершить вход');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isRegister) {
      if (!usernameValid) {
        setError('Имя пользователя: 3–30 символов, только латиница, цифры и _');
        return;
      }
      if (!draftName.trim()) {
        setError('Укажите имя для отображения');
        return;
      }
      if (draftPassword.length < 8) {
        setError('Пароль должен быть не менее 8 символов');
        return;
      }
      if (!termsAccepted) {
        setError('Необходимо принять условия использования');
        return;
      }

      setLoading(true);
      try {
        await register();
      } catch (err: any) {
        setError(err.message || 'Ошибка регистрации');
      } finally {
        setLoading(false);
      }
    } else {
      if (!draftUsername.trim()) {
        setError('Введите имя пользователя');
        return;
      }
      if (!draftPassword) {
        setError('Введите пароль');
        return;
      }

      setLoading(true);
      try {
        await login();
      } catch (err: any) {
        setError(err.message || 'Неверный логин или пароль');
      } finally {
        setLoading(false);
      }
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
      <div className={styles.ambient} />
      <div className={styles.noise} />

      <div className={styles.container}>
        <div className={styles.brand}>
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
                setUsernameTouched(false);
                setTermsAccepted(false);
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
                setUsernameTouched(false);
                setTermsAccepted(false);
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

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="displayName">
                Имя и фамилия
              </label>
              <input
                id="displayName"
                className={styles.input}
                type="text"
                placeholder="Например, Александр"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value.slice(0, 64))}
                autoComplete="name"
                required
                autoFocus
              />
            </div>
          )}

          {isSocialProfile && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="displayName">
                Как вас зовут
              </label>
              <input
                id="displayName"
                className={styles.input}
                type="text"
                placeholder="Имя и фамилия"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value.slice(0, 64))}
                autoComplete="name"
                required
                autoFocus
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">
              Имя пользователя (username)
            </label>
            <input
              id="username"
              className={`${styles.input}${showUsernameError ? ` ${styles.inputError}` : ''}${(isRegister || isSocialProfile) && usernameTouched && usernameValid ? ` ${styles.inputValid}` : ''}`}
              type="text"
              placeholder={isRegister || isSocialProfile ? 'username (3–30, a–z, 0–9, _)' : 'username'}
              value={draftUsername}
              onChange={(e) =>
                setDraftUsername(
                  e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30)
                )
              }
              onBlur={() => setUsernameTouched(true)}
              autoComplete="username"
              spellCheck={false}
              required
              autoFocus={!isRegister && !isSocialProfile}
            />
            {showUsernameError && (
              <span className={styles.fieldError}>3–30 символов: латиница, цифры, _</span>
            )}
          </div>

          {!isSocialProfile && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">
                Пароль
              </label>
              <div className={styles.passwordContainer}>
                <input
                  id="password"
                  className={`${styles.input} ${styles.passwordInput}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder={isRegister ? 'Минимум 8 символов' : 'Пароль'}
                  value={draftPassword}
                  onChange={(e) => setDraftPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className={styles.showPasswordButton}
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isRegister && draftPassword.length > 0 && (
                <div className={styles.strengthBlock}>
                  <div className={styles.strengthMeter}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`${styles.strengthBar}${i <= pwStrength.score ? ` ${styles[pwStrength.level]}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`${styles.strengthLabel} ${styles[pwStrength.level]}`}>
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {isRegister && (
            <div className={styles.termsRow}>
              <input
                id="terms"
                type="checkbox"
                className={styles.termsCheckbox}
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms" className={styles.termsLabel}>
                Я принимаю <a href="#terms">условия использования</a> и <a href="#privacy">политику конфиденциальности</a>
              </label>
            </div>
          )}

          <button
            type="submit"
            className={styles.primary}
            disabled={loading || oauthBusy || (isRegister && !termsAccepted)}
          >
            {loading
              ? isSocialProfile
                ? 'Сохраняем…'
                : isRegister
                  ? 'Создаем аккаунт…'
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
