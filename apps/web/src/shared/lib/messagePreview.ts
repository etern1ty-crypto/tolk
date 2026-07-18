import type { Message } from '../types';

/** Safe one-line body for reply bars / quotes. */
export function formatReplyPreview(msg: Pick<Message, 'text' | 'kind' | 'media'> | null | undefined): string {
  if (!msg) return '';
  const text = (msg.text || '').trim();
  if (text && !text.includes('mock attachment')) {
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  }
  switch (msg.kind) {
    case 'media':
      return 'Фото';
    case 'voice':
      return 'Голосовое';
    case 'circle':
      return 'Кружок';
    case 'file':
      return msg.media?.filename || 'Файл';
    default:
      return text || 'Сообщение';
  }
}

/** Bubble quote: "Author: body" */
export function formatReplyQuote(
  msg: Pick<Message, 'text' | 'kind' | 'media'> | null | undefined,
  authorName?: string
): string {
  const body = formatReplyPreview(msg);
  if (!body) return '';
  const name = (authorName || '').trim();
  return name ? `${name}: ${body}` : body;
}
