import { fetchApi } from '../../store/appStore';

export type ShareKind = 'user' | 'group' | 'channel' | 'post';

export async function createShareUrl(
  kind: ShareKind,
  targetId: string,
  token: string | null
): Promise<string> {
  const res = await fetchApi(
    '/share-links',
    {
      method: 'POST',
      body: JSON.stringify({ kind, target_id: targetId }),
    },
    token
  );
  const path = res.url || `/s/${res.slug}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function copyShareLink(
  kind: ShareKind,
  targetId: string,
  token: string | null
): Promise<string> {
  const url = await createShareUrl(kind, targetId, token);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  return url;
}
