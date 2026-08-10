// WebRTC 1:1 helpers. Thin on purpose: peer lifecycle/signaling orchestration
// lives in appStore.ts next to activeSocket (same singleton idiom); this file is
// just media capture + ICE-server fetch so the store isn't cluttered with the
// getUserMedia boilerplate that already exists in CircleSheet/ChatPanel.
import { fetchApi } from './api';

/** TURN/STUN config from the gateway. Ephemeral creds, ~1h TTL. */
export async function fetchIceConfig(token: string | null): Promise<RTCIceServer[]> {
  try {
    const res = await fetchApi('/calls/ice-config', {}, token);
    return (res?.iceServers as RTCIceServer[]) || [];
  } catch {
    // A call with no relay still connects on friendly NATs; don't hard-fail.
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

export function getMic(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

export function getCam(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: { facingMode: 'user' },
  });
}

/** Screen share. Browser shows its own picker; audio is best-effort. */
export function getDisplay(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
}

export function stopStream(s: MediaStream | null | undefined) {
  s?.getTracks().forEach((t) => t.stop());
}
