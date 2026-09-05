import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { useIsDesktop } from '../lib/useMediaQuery';
import { useVisualViewport } from '../lib/useVisualViewport';
import {
  clamp,
  createSpring,
  projectMomentum,
  releaseVelocity,
  rubberBand,
  type PointerSample,
} from '../lib/motion';
import { triggerHaptic } from '../lib/haptics';
import styles from './Sheet.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  label?: string;
  wide?: boolean;
  hideHeader?: boolean;
  onEscape?: () => void;
};
type Drag = { id: number; start: number; offset: number; moved: boolean; samples: PointerSample[] };

/** Vaul provides the modal/focus lifecycle; one controller owns all motion.
 * Built-in dragging is disabled so it cannot compete with the specified spring math.
 * Only the handle captures pointers. Content keeps native scrolling and selection.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  label,
  wide,
  hideHeader,
  onEscape,
}: Props) {
  const [mounted, setMounted] = useState(open);
  const desktop = useIsDesktop();
  const viewport = useVisualViewport();
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const closing = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const retained = useRef({ children, title, label });
  if (open) retained.current = { children, title, label };
  const visible = open ? { children, title, label } : retained.current;

  const close = useCallback(
    (velocity = 0, immediate = false, notify = true) => {
      const controller = spring.current;
      const finish = () => {
        closing.current = false;
        setMounted(false);
        if (notify) closeRef.current();
      };
      closing.current = true;
      if (!controller || immediate) {
        controller?.stop();
        finish();
        return;
      }
      controller.to(desktop ? 24 : (sheetRef.current?.offsetHeight ?? 400) + 24, {
        velocity,
        onRest: finish,
      });
    },
    [desktop],
  );

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  useLayoutEffect(() => {
    if (!mounted || !sheetRef.current) return;
    const height = sheetRef.current.offsetHeight + 24;
    const initial = desktop ? 24 : height;
    const controller = createSpring(initial, (y) => {
      const progress = 1 - clamp(y / (desktop ? 24 : height), 0, 1);
      if (sheetRef.current) {
        sheetRef.current.style.transform = desktop
          ? `translateY(${y * 0.5}px) scale(${0.96 + progress * 0.04})`
          : `translateY(${y}px)`;
        sheetRef.current.style.opacity = desktop ? String(progress) : '1';
      }
      if (overlayRef.current) overlayRef.current.style.opacity = String(progress);
    });
    spring.current = controller;
    controller.set(initial);
    if (open) controller.to(0);
    return () => {
      controller.stop();
      spring.current = null;
      drag.current = null;
    };
    // Open/close retargeting below deliberately uses the existing controller.
  }, [mounted, desktop]);
  useLayoutEffect(() => {
    if (!mounted) return;
    if (open) {
      closing.current = false;
      spring.current?.to(0);
    } else close(0, false, false);
  }, [open, mounted, close]);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (desktop || !e.isPrimary || e.button !== 0 || drag.current) return;
    const controller = spring.current;
    if (!controller) return;
    controller.stop();
    closing.current = false;
    suppressClick.current = false;
    drag.current = {
      id: e.pointerId,
      start: e.clientY,
      offset: controller.value,
      moved: false,
      samples: [{ position: controller.value, time: e.timeStamp }],
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = d.offset + e.clientY - d.start;
    const y = raw < 0 ? rubberBand(raw, 400) : raw;
    d.moved ||= Math.abs(e.clientY - d.start) > 6;
    d.samples.push({ position: y, time: e.timeStamp });
    d.samples = d.samples.filter((s) => e.timeStamp - s.time < 120);
    spring.current?.set(y);
  };
  const end = (e: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    suppressClick.current = d.moved || cancelled;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    const y = spring.current?.value ?? 0;
    d.samples.push({ position: y, time: e.timeStamp });
    const velocity = cancelled ? 0 : releaseVelocity(d.samples, e.timeStamp);
    const threshold = Math.min(120, (sheetRef.current?.offsetHeight ?? 400) * 0.4);
    if (!cancelled && d.moved && projectMomentum(y, velocity) > threshold) {
      triggerHaptic('impactLight');
      close(velocity);
    } else spring.current?.to(0, { velocity });
  };

  if (!mounted) return null;
  return (
    <Drawer.Root
      open={mounted}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      dismissible={false}
      modal
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay ref={overlayRef} className={styles.overlay} />
        <div
          className={styles.frame}
          style={{ bottom: desktop ? 0 : viewport.keyboardOffset, top: desktop ? 0 : viewport.top }}
        >
          <Drawer.Content
            ref={sheetRef}
            tabIndex={-1}
            className={`${styles.sheet} ${wide ? styles.wide : ''}`}
            style={{ maxHeight: Math.max(120, viewport.height - (desktop ? 48 : 12)) }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              sheetRef.current?.focus({ preventScroll: true });
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault();
              close();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onEscape) onEscape();
              else close(0, true);
            }}
          >
            <button
              type="button"
              className={styles.handle}
              aria-label="Закрыть окно"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={(e) => end(e)}
              onPointerCancel={(e) => end(e, true)}
              onLostPointerCapture={(e) => end(e, true)}
              onClick={() => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                close();
              }}
            >
              <span aria-hidden="true" />
            </button>
            <div className={hideHeader ? styles.srOnly : styles.heading}>
              <Drawer.Title className={styles.title}>
                {visible.title ?? visible.label ?? 'Окно'}
              </Drawer.Title>
              {!hideHeader && (
                <button
                  className={styles.close}
                  type="button"
                  aria-label="Закрыть"
                  onClick={(e) => close(0, e.detail === 0)}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <Drawer.Description className={styles.srOnly}>
              Закрыть окно можно клавишей Escape.
            </Drawer.Description>
            <div className={styles.content}>{visible.children}</div>
          </Drawer.Content>
        </div>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
