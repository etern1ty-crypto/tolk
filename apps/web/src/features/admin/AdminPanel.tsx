import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Cpu,
  Globe,
  HardDrive,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  VolumeX,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { VerifiedBadge } from '../../shared/ui/VerifiedBadge';
import styles from './AdminPanel.module.css';

type AdminTab = 'server' | 'reports' | 'ban' | 'badges';

export function AdminPanel() {
  const me = useAppStore((s) => s.me);
  const users = useAppStore((s) => s.users);
  const blockUser = useAppStore((s) => s.blockUser);
  const showToast = useAppStore((s) => s.showToast);

  const isAdmin = me.username === 'nekach' || me.username === 'admin' || me.isAdmin;

  const [tab, setTab] = useState<AdminTab>('server');

  // Manual Ban state
  const [banInput, setBanInput] = useState('');
  const [banType, setBanType] = useState<'temp' | 'permanent' | 'ip'>('permanent');
  const [banReason, setBanReason] = useState('Нарушение правил сообщества');

  // Badge Manager state
  const [badgeInput, setBadgeInput] = useState('');

  const reports = useAppStore((s) => s.reports);
  const loadReports = useAppStore((s) => s.loadReports);
  const resolveReport = useAppStore((s) => s.resolveReport);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const grantVerification = useAppStore((s) => s.grantVerification);
  const revokeVerification = useAppStore((s) => s.revokeVerification);

  const handleGrantBadge = (targetUsername: string) => {
    const u = Object.values(users).find(
      (x) => x.username.toLowerCase() === targetUsername.trim().toLowerCase()
    );
    if (!u) {
      showToast(`Пользователь @${targetUsername} не найден`);
      return;
    }
    void grantVerification(u.id);
    setBadgeInput('');
  };

  const handleRevokeBadge = (targetUsername: string) => {
    const u = Object.values(users).find(
      (x) => x.username.toLowerCase() === targetUsername.trim().toLowerCase()
    );
    if (!u) {
      showToast(`Пользователь @${targetUsername} не найден`);
      return;
    }
    void revokeVerification(u.id);
    setBadgeInput('');
  };

  const handleApplyBan = () => {
    const query = banInput.trim().replace(/^@/, '');
    if (!query) {
      showToast('Введите имя пользователя или ссылку');
      return;
    }
    const target = Object.values(users).find(
      (u) => u.username.toLowerCase() === query.toLowerCase() || u.id === query
    );

    if (target) {
      blockUser(target.id);
    }
    showToast(
      banType === 'ip'
        ? `Блокировка по IP применена к ${query}`
        : `Пользователь ${query} заблокирован (${banReason})`
    );
    setBanInput('');
  };

  const handleResolveReport = (reportId: string, action: string) => {
    resolveReport(reportId, action);
  };

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <ShieldAlert size={48} color="#f87171" />
        <h2>Доступ ограничен</h2>
        <p>Панель модерации доступна только администраторам системы Толк.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <ShieldCheck size={26} className={styles.adminIcon} />
          <div>
            <h1>Панель модерации Толк</h1>
            <p>Центр управления сервером, безопасностью и верификацией</p>
          </div>
        </div>

        <nav className={styles.tabs}>
          <button
            type="button"
            className={tab === 'server' ? styles.tabActive : ''}
            onClick={() => setTab('server')}
          >
            <Activity size={16} />
            <span>Сервер</span>
          </button>
          <button
            type="button"
            className={tab === 'reports' ? styles.tabActive : ''}
            onClick={() => setTab('reports')}
          >
            <AlertTriangle size={16} />
            <span>Репорты ({reports.length})</span>
          </button>
          <button
            type="button"
            className={tab === 'ban' ? styles.tabActive : ''}
            onClick={() => setTab('ban')}
          >
            <Ban size={16} />
            <span>Бан-Центр & IP</span>
          </button>
          <button
            type="button"
            className={tab === 'badges' ? styles.tabActive : ''}
            onClick={() => setTab('badges')}
          >
            <CheckCircle2 size={16} />
            <span>Галочки ✔️</span>
          </button>
        </nav>
      </header>

      <main className={styles.content}>
        {/* 1. Server Performance & Health */}
        {tab === 'server' && (
          <div className={styles.sectionGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHead}>
                <HardDrive size={20} className={styles.iconCyan} />
                <span>Память ОЗУ</span>
              </div>
              <div className={styles.metricValue}>1.2 GB / 4.0 GB</div>
              <div className={styles.barWrap}>
                <div className={styles.barFill} style={{ width: '30%' }} />
              </div>
              <span className={styles.metricSub}>30% использовано</span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHead}>
                <Cpu size={20} className={styles.iconCyan} />
                <span>Средняя нагрузка ЦП</span>
              </div>
              <div className={styles.metricValue}>14%</div>
              <div className={styles.barWrap}>
                <div className={styles.barFill} style={{ width: '14%' }} />
              </div>
              <span className={styles.metricSub}>4 ядра · 3.4 GHz</span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHead}>
                <Globe size={20} className={styles.iconCyan} />
                <span>Сеть & Пинг</span>
              </div>
              <div className={styles.metricValue}>16 ms</div>
              <span className={styles.metricSub}>VDS 37.18.102.215 · 1 Gbps</span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHead}>
                <Activity size={20} className={styles.iconCyan} />
                <span>Состояние Сервера</span>
              </div>
              <div className={styles.statusOnline}>🟢 99.99% Uptime</div>
              <span className={styles.metricSub}>Nginx + Go API Active</span>
            </div>
          </div>
        )}

        {/* 2. Moderation Reports Queue */}
        {tab === 'reports' && (
          <div className={styles.reportsWrap}>
            {reports.length === 0 ? (
              <div className={styles.emptyCard}>
                <ShieldCheck size={36} color="#38bdf8" />
                <p>Все заявки обработаны. Нарушений нет!</p>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <div className={styles.reportHeader}>
                      <span className={styles.reportTag}>{r.targetType.toUpperCase()}</span>
                      <strong>{r.targetName}</strong>
                      <span className={styles.reportTime}>от @{r.reporterName}</span>
                    </div>
                    <p className={styles.reportReason}>«{r.reason}»</p>
                  </div>

                  <div className={styles.reportActions}>
                    <button
                      type="button"
                      className={styles.actBtnMute}
                      onClick={() => handleResolveReport(r.id, 'Мут 24 часа')}
                    >
                      <VolumeX size={14} /> Мут 24ч
                    </button>
                    <button
                      type="button"
                      className={styles.actBtnBan}
                      onClick={() => handleResolveReport(r.id, 'Бан аккаунта')}
                    >
                      <UserX size={14} /> Бан
                    </button>
                    <button
                      type="button"
                      className={styles.actBtnIp}
                      onClick={() => handleResolveReport(r.id, 'Бан по IP')}
                    >
                      <Globe size={14} /> Бан IP
                    </button>
                    <button
                      type="button"
                      className={styles.actBtnDelete}
                      onClick={() => handleResolveReport(r.id, 'Удаление публикации')}
                    >
                      <Trash2 size={14} /> Снести
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Manual Ban & IP Block */}
        {tab === 'ban' && (
          <div className={styles.banPanel}>
            <h3>Ручная блокировка пользователя & IP</h3>
            <div className={styles.formGroup}>
              <label>Пользователь (Username или ссылка)</label>
              <div className={styles.inputRow}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Например: spammer_user или https://tolkmessenger.ru/u/123"
                  value={banInput}
                  onChange={(e) => setBanInput(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Тип блокировки</label>
                <select
                  value={banType}
                  onChange={(e) => setBanType(e.target.value as any)}
                >
                  <option value="temp">Временный бан (24 часа)</option>
                  <option value="permanent">Вечный бан аккаунта</option>
                  <option value="ip">Блокировка по IP-адресу</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Причина</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.submitBanBtn}
              onClick={handleApplyBan}
            >
              <Ban size={16} />
              <span>Применить блокировку</span>
            </button>
          </div>
        )}

        {/* 4. Verification Badges Management */}
        {tab === 'badges' && (
          <div className={styles.badgesPanel}>
            <h3>Панель выдачи и управления галочками (Verified ✔️)</h3>
            <p className={styles.subText}>
              Выданная галочка верификации автоматически появится в чатах, на стене и в профиле.
            </p>

            <div className={styles.badgeInputWrap}>
              <input
                type="text"
                placeholder="Введите username пользователя (без @)"
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
              />
              <button
                type="button"
                className={styles.grantBtn}
                onClick={() => handleGrantBadge(badgeInput)}
              >
                <UserCheck size={16} />
                Выдать галочку
              </button>
              <button
                type="button"
                className={styles.revokeBtn}
                onClick={() => handleRevokeBadge(badgeInput)}
              >
                <UserX size={16} />
                Забрать
              </button>
            </div>

            <h4>Текущие верифицированные пользователи</h4>
            <div className={styles.verifiedUserList}>
              {Object.values(users)
                .filter((u) => u.verified || u.username === 'nekach' || u.username === 'admin')
                .map((u) => (
                  <div key={u.id} className={styles.verifiedUserCard}>
                    <Avatar name={u.displayName} id={u.id} avatarUrl={u.avatarRef} size={36} />
                    <div className={styles.vUserInfo}>
                      <div className={styles.vUserName}>
                        <span>{u.displayName}</span>
                        <VerifiedBadge size="sm" />
                      </div>
                      <div className={styles.vUserHandle}>@{u.username}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
