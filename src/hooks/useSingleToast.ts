import { useCallback, useRef } from 'react';
import { toaster } from '../components/common/toasterInstance';

type ToastOptions = Parameters<typeof toaster.create>[0];

export function useSingleToast() {
  const lastToastIdRef = useRef<string | null>(null);

  const dismiss = useCallback(() => {
    if (!lastToastIdRef.current) {
      return;
    }

    toaster.dismiss(lastToastIdRef.current);
    lastToastIdRef.current = null;
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      dismiss();
      lastToastIdRef.current = toaster.create(options);
    },
    [dismiss],
  );

  return { show, dismiss };
}
