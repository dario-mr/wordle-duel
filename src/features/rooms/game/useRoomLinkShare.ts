import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useRoomLinkShare(roomId: string | undefined) {
  const { t } = useTranslation();
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
      window.prompt(t('room.share.copyPromptTitle'), url);
    }
  }, [roomId, t]);

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
        title: t('app.name'),
        text: t('room.share.shareText'),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      await copyRoomLink();
    }
  }, [copyRoomLink, roomId, t]);

  return {
    hasCopiedRoomLink,
    copyRoomLink,
    shareRoomLink,
  };
}
