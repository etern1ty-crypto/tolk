import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Force update check on every load so deploys land
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('SW register failed', err);
      });
    // Soft prompt for notifications once (PWA / mobile)
    try {
      const key = 'tolk-notif-prompted';
      if (
        'Notification' in window &&
        Notification.permission === 'default' &&
        !localStorage.getItem(key)
      ) {
        setTimeout(() => {
          Notification.requestPermission().finally(() => {
            localStorage.setItem(key, '1');
          });
        }, 4000);
      }
    } catch {
      /* ignore */
    }
  });
}
