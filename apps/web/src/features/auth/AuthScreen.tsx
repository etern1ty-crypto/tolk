import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import styles from './AuthScreen.module.css';

export function AuthScreen() {
  const step = useAppStore((s) => s.authStep);
  const phone = useAppStore((s) => s.draftPhone);
  const name = useAppStore((s) => s.draftName);
  const setPhone = useAppStore((s) => s.setPhone);
  const setDraftName = useAppStore((s) => s.setDraftName);
  const submitPhone = useAppStore((s) => s.submitPhone);
  const submitOtp = useAppStore((s) => s.submitOtp);
  const submitProfile = useAppStore((s) => s.submitProfile);

  return (
    <div className={styles.root}>
      <div className={styles.glow} />
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.brand}>
          <div className={styles.logo}>Т</div>
          <h1>Толк.</h1>
          <p className={styles.tagline}>Быстрый · чистый · свой</p>
        </div>

        <div className={styles.steps}>
          {(['phone', 'otp', 'profile'] as const).map((s, i) => (
            <span
              key={s}
              className={
                step === s || (step === 'done' && i === 2)
                  ? styles.dotActive
                  : styles.dot
              }
            />
          ))}
        </div>

        {step === 'phone' && (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              submitPhone();
            }}
          >
            <label className={styles.label} htmlFor="phone">
              Телефон
            </label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              inputMode="tel"
              placeholder="+7 900 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className={styles.primary}
              disabled={phone.trim().length < 6}
            >
              Получить код
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              submitOtp();
            }}
          >
            <label className={styles.label} htmlFor="otp">
              Код из SMS
            </label>
            <input
              id="otp"
              className={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="••••"
              defaultValue="1234"
              autoFocus
            />
            <button type="submit" className={styles.primary}>
              Войти
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              submitProfile();
            }}
          >
            <label className={styles.label} htmlFor="name">
              Как вас зовут
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.primary}>
              Начать
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
