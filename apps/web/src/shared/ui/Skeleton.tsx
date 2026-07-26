import styles from './Skeleton.module.css';

/**
 * Заглушки на время первой загрузки.
 *
 * До них список чатов и лента какое-то время были пусты, а потом рывком
 * заполнялись. Пустой экран читается как «тут ничего нет», а не как «сейчас
 * будет» — разница в том, уйдёт человек или подождёт.
 *
 * Форма повторяет настоящие строки, иначе подмена будет заметна скачком.
 */

/** Строка списка чатов: аватар, имя, превью. */
export function ChatRowSkeleton() {
  return (
    <div className={styles.row} aria-hidden>
      <div className={styles.avatar} />
      <div className={styles.lines}>
        <div className={styles.line} style={{ width: '38%' }} />
        <div className={styles.line} style={{ width: '62%', height: 11 }} />
      </div>
    </div>
  );
}

/** Пост в ленте: автор, пара строк текста. */
export function PostSkeleton() {
  return (
    <div className={styles.post} aria-hidden>
      <div className={styles.postHead}>
        <div className={styles.avatar} />
        <div className={styles.line} style={{ width: 120 }} />
      </div>
      <div className={styles.line} style={{ width: '92%' }} />
      <div className={styles.line} style={{ width: '74%' }} />
    </div>
  );
}

/**
 * Несколько заглушек подряд. Роль status + aria-busy: скринридер сообщает о
 * загрузке, а сами полоски скрыты как декоративные.
 */
export function SkeletonList({
  count = 5,
  kind = 'chat',
}: {
  count?: number;
  kind?: 'chat' | 'post';
}) {
  const Item = kind === 'post' ? PostSkeleton : ChatRowSkeleton;
  return (
    <div role="status" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
