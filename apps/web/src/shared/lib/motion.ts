/** WWDC fluid-interface math. Velocities are always pixels per second. */
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));
export const rubberBand = (distance: number, dimension = 300) =>
  (distance * dimension * 0.55) / (dimension + 0.55 * Math.abs(distance));
export const projectMomentum = (position: number, velocity: number, deceleration = 0.998) =>
  position + ((velocity / 1000) * deceleration) / (1 - deceleration);
export const gaussianScale = (distance: number, sigma = 26) =>
  1 + 0.58 * Math.exp(-(distance * distance) / (2 * sigma * sigma));

export type PointerSample = { position: number; time: number };
export function releaseVelocity(samples: PointerSample[], now: number): number {
  const recent = samples.filter((s) => now - s.time <= 100);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = last.time - first.time;
  return dt > 0 ? ((last.position - first.position) / dt) * 1000 : 0;
}

/** Analytical solution, stable at 60/120Hz and after dropped frames. */
export function springStep(
  position: number,
  velocity: number,
  target: number,
  dt: number,
  damping = 1,
  response = 0.38,
): { position: number; velocity: number } {
  const omega = (2 * Math.PI) / response;
  const displacement = position - target;
  if (damping >= 1) {
    const c = velocity + omega * displacement;
    const decay = Math.exp(-omega * dt);
    return {
      position: target + (displacement + c * dt) * decay,
      velocity: (velocity - omega * c * dt) * decay,
    };
  }
  const a = damping * omega;
  const b = omega * Math.sqrt(1 - damping * damping);
  const c = (velocity + a * displacement) / b;
  const cos = Math.cos(b * dt),
    sin = Math.sin(b * dt),
    decay = Math.exp(-a * dt);
  const offset = displacement * cos + c * sin;
  return {
    position: target + decay * offset,
    velocity: decay * (-a * offset - displacement * b * sin + c * b * cos),
  };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Retargets from the live value. stop() preserves momentum for interruption. */
export function createSpring(initial: number, update: (value: number) => void) {
  let value = initial,
    velocity = 0,
    frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const set = (next: number) => {
    stop();
    value = next;
    velocity = 0;
    update(value);
  };
  return {
    get value() {
      return value;
    },
    get velocity() {
      return velocity;
    },
    set,
    stop,
    to(
      target: number,
      options: { velocity?: number; damping?: number; response?: number; onRest?: () => void } = {},
    ) {
      stop();
      velocity = options.velocity ?? velocity;
      if (prefersReducedMotion()) {
        set(target);
        options.onRest?.();
        return;
      }
      let previous = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.064, Math.max(0.001, (now - previous) / 1000));
        previous = now;
        const next = springStep(
          value,
          velocity,
          target,
          dt,
          options.damping ?? 1,
          options.response ?? 0.38,
        );
        value = next.position;
        velocity = next.velocity;
        update(value);
        if (Math.abs(value - target) < 0.25 && Math.abs(velocity) < 2) {
          value = target;
          velocity = 0;
          frame = 0;
          update(value);
          options.onRest?.();
        } else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
  };
}
