/** Leading-edge presence scheduled outside the raw input handler. No trailing ghost typing. */
export function createTypingThrottle(send: () => void, interval = 3000) {
  let lastSent = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    schedule() {
      if (timer !== null || performance.now() - lastSent < interval) return;
      timer = setTimeout(() => {
        timer = null;
        lastSent = performance.now();
        send();
      }, 0);
    },
    cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    },
  };
}
