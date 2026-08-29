import { useMeQuery } from '../query/meQueries';

export function useCurrentUser() {
  return useMeQuery().data;
}
