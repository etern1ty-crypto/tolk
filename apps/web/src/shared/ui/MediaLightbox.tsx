import { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconBtn } from './IconBtn';
import styles from './MediaLightbox.module.css';

type Props = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export function MediaLightbox({ src, alt = 'Превью', onClose }: Props) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Просмотр фото" onClick={onClose}>
      <IconBtn className={styles.close} onClick={onClose} aria-label="Закрыть">
        <X size={20} />
      </IconBtn>
      <img
        src={src}
        alt={alt}
        className={styles.image}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
