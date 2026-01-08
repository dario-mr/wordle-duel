function requireEnv(name: string): string {
  const value = (import.meta.env as Record<string, unknown>)[name];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  throw new Error(`Missing required env var: ${name}`);
}

export function getWdsBaseUrl(): string {
  return requireEnv('VITE_WDS_BASE_URL');
}

export function getRestApiV1BaseUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/v1/';
  }
  return new URL('./api/v1/', getWdsBaseUrl()).toString();
}

export function getWsBrokerUrl(): string {
  const wsHttpUrl = new URL('./ws', getWdsBaseUrl());
  wsHttpUrl.protocol = wsHttpUrl.protocol === 'https:' ? 'wss:' : 'ws:';

  return wsHttpUrl.toString();
}

export function getShareRoomUrl(roomId: string): string {
  return new URL(`${import.meta.env.BASE_URL}rooms/${roomId}`, window.location.origin).toString();
}
