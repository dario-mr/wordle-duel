const PROD_BACKEND_BASE_PATH = '/wordle-duel-service/';
const PROD_API_V1_BASE_PATH = '/wordle-duel-service/api/v1/';
const PROD_WS_PATH = '/wordle-duel-service/ws';

export function getBackendBasePath(): string {
  return import.meta.env.DEV ? '/' : PROD_BACKEND_BASE_PATH;
}

export function getRestApiV1BaseUrl(): string {
  return import.meta.env.DEV ? '/api/v1/' : PROD_API_V1_BASE_PATH;
}

export function getWsBrokerUrl(): string {
  const wsHttpUrl = new URL(import.meta.env.DEV ? '/ws' : PROD_WS_PATH, window.location.origin);
  wsHttpUrl.protocol = wsHttpUrl.protocol === 'https:' ? 'wss:' : 'ws:';

  return wsHttpUrl.toString();
}
