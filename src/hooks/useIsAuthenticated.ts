import { useEffect, useState } from 'react';
import { getAccessToken, subscribeAccessToken } from '../auth/tokenManager.ts';

// TODO consider deleting if really not used
export function useIsAuthenticated(): boolean {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    return subscribeAccessToken(() => {
      setIsAuthed(Boolean(getAccessToken()));
    });
  }, []);

  return isAuthed;
}
