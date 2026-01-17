import { useEffect, useState } from 'react';
import { getAccessToken, subscribeAccessToken } from '../auth/tokenManager.ts';

export function useIsAuthenticated(): boolean {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    return subscribeAccessToken(() => {
      setIsAuthed(Boolean(getAccessToken()));
    });
  }, []);

  return isAuthed;
}
