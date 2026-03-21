import { useSyncExternalStore } from 'react';
import { getCurrentUser, subscribeCurrentUser } from '../api/auth';

export function useCurrentUser() {
  return useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);
}
