import { useLayoutEffect, useRef, type ComponentProps } from 'react';

type Props = Omit<ComponentProps<'textarea'>, 'ref'> & { maxHeight?: number };
/** Keeps pasted paragraphs/newlines visible; only the draft field is measured. */
export function AutoTextarea({ maxHeight = 140, value, style, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let width = 0;
    const resize = () => {
      el.style.height = 'auto';
      const css = getComputedStyle(el);
      const border = parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
      const height = el.scrollHeight + border;
      el.style.height = `${Math.min(maxHeight, height)}px`;
      el.style.overflowY = height > maxHeight ? 'auto' : 'hidden';
    };
    resize();
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== width) {
        width = entry.contentRect.width;
        resize();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, maxHeight]);
  return (
    <textarea
      {...props}
      ref={ref}
      rows={1}
      value={value}
      style={{ ...style, resize: 'none', maxHeight }}
    />
  );
}
