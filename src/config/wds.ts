import { PROD_API_V1_BASE_PATH, PROD_WS_PATH } from '../constants.ts';

export function getRestApiV1BaseUrl(): string {
  return import.meta.env.DEV ? '/api/v1/' : PROD_API_V1_BASE_PATH;
}

export function getWsBrokerUrl(): string {
  const wsHttpUrl = new URL(import.meta.env.DEV ? '/ws' : PROD_WS_PATH, window.location.origin);
  wsHttpUrl.protocol = wsHttpUrl.protocol === 'https:' ? 'wss:' : 'ws:';

  return wsHttpUrl.toString();
}
