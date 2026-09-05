import { useEffect, useState } from 'react';

function readViewport() {
  const v = window.visualViewport;
  return {
    height: v?.height ?? window.innerHeight,
    top: v?.offsetTop ?? 0,
    keyboardOffset: Math.max(
      0,
      window.innerHeight - (v?.height ?? window.innerHeight) - (v?.offsetTop ?? 0),
    ),
  };
}

export function useVisualViewport() {
  const [viewport, setViewport] = useState(readViewport);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewport(readViewport()));
    };
    const v = window.visualViewport;
    v?.addEventListener('resize', update);
    v?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      v?.removeEventListener('resize', update);
      v?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return viewport;
}
