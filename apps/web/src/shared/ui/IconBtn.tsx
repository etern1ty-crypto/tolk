import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconBtn.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'soft' | 'mint' | 'danger';
};

export function IconBtn({
  children,
  size = 'md',
  variant = 'ghost',
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={[styles.btn, styles[size], styles[variant], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
