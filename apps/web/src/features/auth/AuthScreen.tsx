import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './AuthScreen.module.css';

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

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const isRegister = authMode === 'register';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) await register();
      else await login();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>Т</div>
          <h1>Толк.</h1>
          <p className={styles.tagline}>Быстрый · чистый · свой</p>
        </div>

        <div className={styles.toggle}>
          <button
            type="button"
            className={authMode === 'login' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setAuthMode('login')}
          >
            Войти
          </button>
          <button
            type="button"
            className={authMode === 'register' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setAuthMode('register')}
          >
            Регистрация
          </button>
        </div>

        <form className={styles.form} onSubmit={submit} autoComplete="on">
          {isRegister && (
            <div style={{ overflow: 'hidden' }}>
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
                autoComplete="given-name"
                style={{ marginBottom: '10px' }}
              />
            </div>
          )}

          <label className={styles.label} htmlFor="username">
            Имя пользователя
          </label>
          <input
            id="username"
            className={styles.input}
            type="text"
            placeholder={isRegister ? 'username (3–30 символов)' : 'username'}
            value={draftUsername}
            onChange={(e) => setDraftUsername(e.target.value)}
            autoComplete="username"
            spellCheck={false}
          />

          <label className={styles.label} htmlFor="password" style={{ marginTop: '10px' }}>
            Пароль
          </label>
          <div className={styles.pwWrap}>
            <input
              id="password"
              className={`${styles.input} ${styles.pwInput}`}
              type={showPw ? 'text' : 'password'}
              placeholder={isRegister ? 'Минимум 6 символов' : '••••••'}
              value={draftPassword}
              onChange={(e) => setDraftPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
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

          <button
            type="submit"
            className={styles.primary}
            disabled={loading}
            style={{ marginTop: '18px' }}
          >
            {loading
              ? isRegister
                ? 'Создаём аккаунт...'
                : 'Входим...'
              : isRegister
                ? 'Создать аккаунт'
                : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
