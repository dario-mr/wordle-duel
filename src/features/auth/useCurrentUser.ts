import { useMeQuery } from './queries';

export function useCurrentUser() {
  return useMeQuery().data;
}
