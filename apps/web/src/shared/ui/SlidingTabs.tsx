import React, { useEffect, useRef, useState } from 'react';
import styles from './SlidingTabs.module.css';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

interface SlidingTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export function SlidingTabs<T extends string>({
  tabs,
  activeId,
  onChange,
  className,
  variant = 'horizontal',
}: SlidingTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({
    transform: variant === 'vertical' ? 'translateY(0px)' : 'translateX(0px)',
    width: variant === 'vertical' ? '100%' : 0,
    height: variant === 'vertical' ? 0 : '100%',
    opacity: 0,
  });

  const updatePill = (animate = true) => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
    if (!activeEl) return;

    if (variant === 'vertical') {
      const offsetTop = activeEl.offsetTop;
      const offsetHeight = activeEl.offsetHeight;

      setPillStyle({
        transform: `translateY(${offsetTop}px)`,
        height: `${offsetHeight}px`,
        width: '100%',
        opacity: 1,
        transition: animate ? undefined : 'none',
      });
    } else {
      const offsetLeft = activeEl.offsetLeft;
      const offsetWidth = activeEl.offsetWidth;

      setPillStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`,
        opacity: 1,
        transition: animate ? undefined : 'none',
      });
    }
  };

  useEffect(() => {
    updatePill(true);
  }, [activeId, variant]);

  useEffect(() => {
    const onResize = () => updatePill(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId, variant]);

  return (
    <div
      ref={containerRef}
      className={`${styles.tabsContainer} ${variant === 'vertical' ? styles.vertical : ''} ${className || ''}`}
      role="tablist"
    >
      <span className={styles.pill} style={pillStyle} aria-hidden="true" />
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.tabBtn} ${active ? styles.tabActive : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && (
              <span className={styles.iconWrap}>
                <span className={styles.icon}>{tab.icon}</span>
                {tab.badge !== undefined && tab.badge !== 0 && (
                  <span className={styles.tBadge} data-open={Boolean(tab.badge)}>
                    <span className={styles.tBadgeDot}>{tab.badge}</span>
                  </span>
                )}
              </span>
            )}
            {!tab.icon && tab.badge !== undefined && tab.badge !== 0 && (
              <span className={styles.tBadgeInline} data-open={Boolean(tab.badge)}>
                <span className={styles.tBadgeDot}>{tab.badge}</span>
              </span>
            )}
            {tab.label && <span className={styles.label}>{tab.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
