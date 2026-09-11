import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<unknown>;
};

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneApp());
  const [isIos] = useState(() => isIosDevice());

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = () => {
    const prompt = installPrompt;
    if (!prompt) {
      return;
    }

    setInstallPrompt(null);
    void prompt.prompt().catch(() => undefined);
  };

  return {
    canInstall: !isIos && !isStandalone && installPrompt != null,
    install,
    isIos,
    isStandalone,
  };
}

function isStandaloneApp() {
  const safariStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    safariStandalone === true
  );
}

function isIosDevice() {
  const userAgent = navigator.userAgent;
  return (
    ['iPad', 'iPhone', 'iPod'].some((device) => userAgent.includes(device)) ||
    (userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
}
