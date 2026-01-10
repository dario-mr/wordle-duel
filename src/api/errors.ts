import { i18n } from '../i18n';
import { WdsApiError } from './wdsClient';

export function getErrorMessage(err: unknown): string {
  if (err instanceof WdsApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return i18n.t('errors.unknown');
}
