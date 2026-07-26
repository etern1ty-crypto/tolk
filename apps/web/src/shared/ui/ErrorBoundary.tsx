import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Граница ошибок.
 *
 * До неё одно исключение при отрисовке роняло всё дерево, и человек видел
 * белый экран — без объяснения и без способа выбраться, кроме перезагрузки,
 * до которой ещё надо додуматься.
 *
 * Классовый компонент здесь не выбор стиля: перехватывать ошибки отрисовки
 * умеет только он, хука для этого в React нет.
 */

interface Props {
  children: ReactNode;
  /** Что показать вместо упавшего поддерева. По умолчанию — экран целиком. */
  fallback?: (reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Пока нет Sentry — хотя бы в консоль, со стеком компонентов: без него
    // непонятно, какой именно экран упал.
    console.error('Отрисовка упала:', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);

    return (
      <div
        role="alert"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 24,
          background: 'var(--bg, #000)',
          color: 'var(--text-primary, #f5f5f5)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Что-то сломалось</p>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text-secondary, #a3a3a3)',
            margin: 0,
            maxWidth: 320,
            lineHeight: 1.45,
          }}
        >
          Экран не отрисовался. Сообщения не потеряны — они на сервере.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {/* Сначала мягкий путь: перерисовать без перезагрузки и потери сессии. */}
          <button
            type="button"
            onClick={this.reset}
            style={{
              background: 'var(--text-primary, #f5f5f5)',
              color: 'var(--bg, #000)',
              border: 'none',
              borderRadius: 999,
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary, #a3a3a3)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
              borderRadius: 999,
              padding: '10px 20px',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }
}
