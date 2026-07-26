/**
 * Единственная дверь наружу.
 *
 * Раньше обращения к серверу были размазаны: сам `fetch` жил внутри
 * двухтысячестрочного хранилища, а трёхшаговая загрузка файла была переписана
 * в семи местах. Копии разошлись — где-то проверяли результат PUT, где-то нет,
 * и обои «устанавливались» на ссылку, за которой не было байтов.
 */

/**
 * Адрес API. По умолчанию тот же origin, что и страница.
 *
 * Это осознанный выбор, а не упрощение: браузер шлёт запросы с заголовком
 * Authorization и типом application/json, а такие запросы к другому имени
 * требуют предварительного запроса CORS — лишний круг до сервера на каждый
 * новый путь. Своему же origin он не нужен вовсе.
 *
 * Отдельное имя api.tolkmessenger.ru поднято и работает — оно нужно тому, у
 * кого нет CORS: нативному приложению. Переключается переменной сборки
 * VITE_API_URL, править код не требуется.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

/** Адрес веб-сокета. Тем же правилом: свой origin, если не сказано иное. */
export function socketUrl(token: string): string {
  const base =
    import.meta.env.VITE_WS_URL ||
    `${API_URL.replace(/^http/, 'ws')}/ws`;
  return `${base}?token=${encodeURIComponent(token)}`;
}

/** Ошибка запроса. Код ответа — на объекте, а не в тексте сообщения. */
export interface ApiError extends Error {
  status: number;
}

function apiError(message: string, status: number): ApiError {
  const e = new Error(message) as ApiError;
  e.status = status;
  return e;
}

/**
 * Запрос к API.
 *
 * Код ответа кладётся на саму ошибку: разбирать его из текста нельзя — сервер
 * отвечает словами («Unauthorized»), и проверка на «401» в сообщении не
 * срабатывала никогда, из-за чего протухшая сессия не выходила, а бесконечно
 * перезапрашивала /me.
 */
export async function fetchApi(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<any> {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: text };
    }
    throw apiError(parsed.error || `HTTP ${res.status}`, res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Тип содержимого — определяет проверки на стороне сервера. */
export type MediaKind = 'image' | 'voice' | 'circle' | 'file';

/**
 * Под что загружают. Определяет, останется ли файл на диске: аватарки,
 * обложки и фоны чатов в облако не уходят — они мелкие и нужны на каждом
 * экране. См. offload.go на стороне сервера.
 */
export type MediaPurpose =
  | 'avatar'
  | 'banner'
  | 'wallpaper'
  | 'post'
  | 'message'
  | 'voice'
  | 'circle';

/**
 * Загружает файл целиком: регистрация → передача байтов → подтверждение.
 *
 * Все три шага обязательны, и провал любого означает, что файла нет. Раньше
 * это было переписано семь раз, и часть копий не смотрела на результат
 * передачи — тогда запись о файле оставалась, а байтов за ней не было.
 *
 * @returns адрес файла и его идентификатор — пост ссылается на второй
 */
export async function uploadFile(
  file: Blob & { type?: string },
  opts: { kind: MediaKind; purpose: MediaPurpose; mime?: string },
  token: string | null
): Promise<{ url: string; mediaId: string }> {
  const mime = opts.mime || file.type || 'application/octet-stream';

  const registered = await fetchApi(
    '/media/uploads',
    {
      method: 'POST',
      body: JSON.stringify({ mime, size: file.size, kind: opts.kind, purpose: opts.purpose }),
    },
    token
  );

  const put = await fetch(registered.upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': mime,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!put.ok) {
    throw apiError(`Файл не загрузился: ${put.status}`, put.status);
  }

  await fetchApi(`/media/${registered.media_id}/complete`, { method: 'POST' }, token);
  return { url: registered.public_url as string, mediaId: registered.media_id as string };
}
