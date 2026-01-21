import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/users';

export function meQueryKey() {
  return ['me'] as const;
}

export function useMeQuery(args: { enabled: boolean }) {
  return useQuery({
    queryKey: meQueryKey(),
    queryFn: getMe,
    enabled: args.enabled,
  });
}
