import { WdsApiError } from './wdsClient';

export function getErrorMessage(err: unknown): string {
  if (err instanceof WdsApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}
