import { useState, type CSSProperties, type ReactNode } from 'react';
import styles from './PostImage.module.css';

/**
 * Картинка пользователя, которая умеет не загрузиться.
 *
 * Медиа живёт не только на диске: часть файлов вынесена в Google Drive, и при
 * протухшем токене сервер отдаёт отказ. Обычный <img> показывает в этом месте
 * системную «битую картинку» — она читается как поломка приложения, хотя файл
 * просто временно недоступен.
 *
 * Поэтому отказ показываем сами: спокойный прямоугольник вместо тревожного
 * значка. Пост при этом остаётся читаемым — текст, реакции и комментарии на
 * месте.
 */

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Чем заменить при отказе. null — не показывать ничего (для обложек). */
  fallback?: ReactNode | null;
}

export function PostImage({ src, alt = 'медиа', className, style, fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div className={`${styles.placeholder} ${className ?? ''}`} role="img" aria-label="Фото недоступно">
        <span className={styles.icon} aria-hidden>▢</span>
        <span className={styles.caption}>Фото недоступно</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      // Картинки ниже экрана не должны задерживать первую отрисовку ленты.
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
