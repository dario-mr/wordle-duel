import { i18n } from '../i18n';
import { WdsApiError } from './types';

export function getErrorMessage(err: unknown): string {
  if (err instanceof WdsApiError) {
    const key = `errors.api.${err.code}`;
    return i18n.exists(key) ? i18n.t(key, { status: err.status }) : i18n.t('errors.unknown');
  }

  if (err instanceof Error) {
    return err.message;
  }
  return i18n.t('errors.unknown');
}
