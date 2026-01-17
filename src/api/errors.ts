import { i18n } from '../i18n';

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return i18n.t('errors.unknown');
}
