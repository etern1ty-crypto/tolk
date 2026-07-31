import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SlidingTabs } from '../../shared/ui/SlidingTabs';
import { Sparkles, ArrowRight } from 'lucide-react';
import styles from './AuthScreen.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const OAUTH_PROVIDER_KEY = 'tolk_oauth_provider';

const INTRO_SLIDES = [
  {
    tag: 'ТОЛК 2.0',
    title: 'Добро пожаловать',
    subtitle: 'Наконец-то ТОЛКовый мессенджер..',
    accentColor: '#38bdf8',
  },
  {
    tag: 'КОМФОРТ',
    title: 'Здесь начинается ваше удобство',
    subtitle: 'Мгновенный обмен идеями, эмоциями и вдохновением без шума',
    accentColor: '#c084fc',
  },
  {
    tag: 'ЭСТЕРИКА & СВОБОДА',
    title: 'Абсолютная эстетика',
    subtitle: 'Безграничная Стена, кастомные фоны, эффекты и живые эмоции',
    accentColor: '#f472b6',
  },
  {
    tag: 'ЛИЧНОЕ ПРОСТРАНСТВО',
    title: 'Ваше личное пространство',
    subtitle: 'Быстрый · чистый · свой — добро пожаловать в Толк',
    accentColor: '#4ade80',
  },
];

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

  const [slideIndex, setSlideIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBusy, setOauthBusy] = useState(false);

  const isRegister = authMode === 'register';
  const isSocialProfile = authMode === 'social_profile';

  // Auto-advance slides every 5.5s
  useEffect(() => {
    if (showForm) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % INTRO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [showForm]);

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

    setShowForm(true);
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
        'Яндекс ID не настроен (VITE_YANDEX_CLIENT_ID). Войдите по username/паролю.'
      );
      return;
    }
    try {
      sessionStorage.setItem(OAUTH_PROVIDER_KEY, 'yandex');
    } catch {
      /* ignore */
    }
    const redirectUri = window.location.origin;
    const url = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const startVK = () => {
    setError(null);
    const clientId = import.meta.env.VITE_VK_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError('VK ID не настроен (VITE_VK_CLIENT_ID). Войдите по username/паролю.');
      return;
    }
    try {
      sessionStorage.setItem(OAUTH_PROVIDER_KEY, 'vk');
    } catch {
      /* ignore */
    }
    const redirectUri = window.location.origin;
    const url = `https://oauth.vk.com/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&display=page&scope=email&response_type=token&v=5.131`;
    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = draftUsername.trim();
    if (!USERNAME_RE.test(u)) {
      setError('Имя пользователя: 3–30 символов (латиница, цифры, _)');
      return;
    }

    if (isSocialProfile) {
      setLoading(true);
      try {
        await completeSocialProfile();
      } catch (err: any) {
        setError(err.message || 'Не удалось завершить профиль');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!draftPassword) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register();
      } else {
        await login();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = INTRO_SLIDES[slideIndex];

  return (
    <div className={styles.root}>
      {!showForm ? (
        /* Intro Welcome Carousel View */
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div
              className={styles.introGlow}
              style={{ background: currentSlide.accentColor }}
            />
            
            <span
              className={styles.introTag}
              style={{ color: currentSlide.accentColor, borderColor: `${currentSlide.accentColor}44` }}
            >
              <Sparkles size={13} />
              <span>{currentSlide.tag}</span>
            </span>

            <h1 className={styles.introTitle}>{currentSlide.title}</h1>
            <p className={styles.introSub}>{currentSlide.subtitle}</p>

            <div className={styles.introDots}>
              {INTRO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dot} ${i === slideIndex ? styles.dotActive : ''}`}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>

            <div className={styles.introActions}>
              <button
                type="button"
                className={styles.skipBtn}
                onClick={() => setShowForm(true)}
              >
                Пропустить
              </button>

              <button
                type="button"
                className={styles.nextBtn}
                onClick={() => {
                  if (slideIndex < INTRO_SLIDES.length - 1) {
                    setSlideIndex((s) => s + 1);
                  } else {
                    setShowForm(true);
                  }
                }}
              >
                <span>{slideIndex === INTRO_SLIDES.length - 1 ? 'Начать' : 'Далее'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Login / Register Form View */
        <div className={styles.card}>
          <header className={styles.header}>
            <span className={styles.logoMark}>Т.</span>
            <p className={styles.subtitle}>Быстрый · чистый · свой</p>
          </header>

          {isSocialProfile ? (
            <div className={styles.socialNotice}>
              <p className={styles.socialTitle}>Почти готово!</p>
              <p className={styles.socialSub}>
                {socialPending?.provider === 'yandex' ? 'Яндекс ID' : 'VK ID'} подключен. Укажите логин и имя для профиля.
              </p>
            </div>
          ) : (
            <SlidingTabs
              className={styles.tabs}
              tabs={[
                { id: 'login', label: 'Вход' },
                { id: 'register', label: 'Регистрация' },
              ]}
              activeId={authMode}
              onChange={(id) => {
                setError(null);
                setAuthMode(id as 'login' | 'register');
              }}
            />
          )}

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="auth-username">Имя пользователя (@username)</label>
              <input
                id="auth-username"
                type="text"
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value.toLowerCase())}
                placeholder="например: alex"
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </div>

            {(isRegister || isSocialProfile) && (
              <div className={styles.field}>
                <label htmlFor="auth-display-name">Отображаемое имя</label>
                <input
                  id="auth-display-name"
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Алексей"
                  autoComplete="name"
                />
              </div>
            )}

            {!isSocialProfile && (
              <div className={styles.field}>
                <label htmlFor="auth-password">Пароль</label>
                <div className={styles.pwWrap}>
                  <input
                    id="auth-password"
                    type={showPw ? 'text' : 'password'}
                    value={draftPassword}
                    onChange={(e) => setDraftPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading || oauthBusy}>
              {loading
                ? 'Минутку…'
                : isSocialProfile
                ? 'Завершить вход'
                : isRegister
                ? 'Создать аккаунт'
                : 'Войти'}
            </button>
          </form>

          {isSocialProfile && (
            <button type="button" className={styles.cancelBtn} onClick={() => cancelSocialProfile()}>
              Отмена
            </button>
          )}

          {!isSocialProfile && (
            <>
              <div className={styles.divider}>
                <span>или через</span>
              </div>

              <div className={styles.oauthRow}>
                <button
                  type="button"
                  className={styles.oauthBtnYandex}
                  onClick={startYandex}
                  disabled={loading || oauthBusy}
                >
                  <span className={styles.yandexBadge}>Я</span>
                  <span>Яндекс</span>
                </button>

                <button
                  type="button"
                  className={styles.oauthBtnVK}
                  onClick={startVK}
                  disabled={loading || oauthBusy}
                >
                  <span className={styles.vkBadge}>VK</span>
                  <span>ВКонтакте</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
