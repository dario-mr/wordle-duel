import { useCallback, useEffect, useRef, useState } from 'react';

export function useRoomLinkShare(roomId: string | undefined) {
  const [hasCopiedRoomLink, setHasCopiedRoomLink] = useState(false);
  const hideCopiedTimeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideCopiedTimeoutIdRef.current !== null) {
        window.clearTimeout(hideCopiedTimeoutIdRef.current);
        hideCopiedTimeoutIdRef.current = null;
      }
    };
  }, []);

  const copyRoomLink = useCallback(async () => {
    if (!roomId) {
      return;
    }

    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setHasCopiedRoomLink(true);

      if (hideCopiedTimeoutIdRef.current !== null) {
        window.clearTimeout(hideCopiedTimeoutIdRef.current);
      }

      hideCopiedTimeoutIdRef.current = window.setTimeout(() => {
        setHasCopiedRoomLink(false);
        hideCopiedTimeoutIdRef.current = null;
      }, 2000);
    } catch {
      setHasCopiedRoomLink(false);
      window.prompt('Copy this room link:', url);
    }
  }, [roomId]);

  const shareRoomLink = useCallback(async () => {
    if (!roomId) {
      return;
    }

    const url = window.location.href;

    if (typeof navigator.share !== 'function') {
      await copyRoomLink();
      return;
    }

    try {
      await navigator.share({
        url,
        title: 'Wordle Duel',
        text: 'Join my Wordle Duel room',
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      await copyRoomLink();
    }
  }, [copyRoomLink, roomId]);

  return {
    hasCopiedRoomLink,
    copyRoomLink,
    shareRoomLink,
  };
}
