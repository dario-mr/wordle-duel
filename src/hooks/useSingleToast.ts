import { useCallback, useRef } from 'react';
import { toaster } from '../components/common/toasterInstance';

type ToastOptions = Parameters<typeof toaster.create>[0];

const DURATION_BUFFER_MS = 250;

export function useSingleToast() {
  const lastToastIdRef = useRef<string | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimeout = useCallback(() => {
    if (!dismissTimeoutRef.current) {
      return;
    }

    clearTimeout(dismissTimeoutRef.current);
    dismissTimeoutRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    clearDismissTimeout();

    if (!lastToastIdRef.current) {
      return;
    }

    toaster.dismiss(lastToastIdRef.current);
    lastToastIdRef.current = null;
  }, [clearDismissTimeout]);

  const show = useCallback(
    (options: ToastOptions) => {
      dismiss();

      const toastId = toaster.create(options);
      lastToastIdRef.current = toastId;

      // iOS/Safari can leave the toast region in a paused state (pointer/focus within),
      // which prevents the built-in duration timer from completing.
      // Only enforce a hard timeout when a finite duration is explicitly provided.
      if (
        typeof options.duration === 'number' &&
        Number.isFinite(options.duration) &&
        options.duration > 0
      ) {
        dismissTimeoutRef.current = setTimeout(() => {
          toaster.dismiss(toastId);

          if (lastToastIdRef.current === toastId) {
            lastToastIdRef.current = null;
          }

          dismissTimeoutRef.current = null;
        }, options.duration + DURATION_BUFFER_MS);
      }
    },
    [dismiss],
  );

  return { show, dismiss };
}
