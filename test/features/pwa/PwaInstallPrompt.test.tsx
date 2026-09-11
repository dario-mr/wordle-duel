import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PwaInstallPrompt } from '../../../src/features/pwa/PwaInstallPrompt';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@chakra-ui/react', () => ({
  Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

describe('PwaInstallPrompt', () => {
  it('shows and triggers the browser install prompt', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<unknown>;
    };
    event.prompt = prompt;

    render(<PwaInstallPrompt />);
    window.dispatchEvent(event);

    const installButton = await screen.findByRole('button', { name: 'home.install.button' });
    expect(screen.getByText('home.install.quickAccess')).toBeTruthy();
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(prompt).toHaveBeenCalledOnce();
      expect(screen.queryByRole('button', { name: 'home.install.button' })).toBeNull();
    });
  });

  it('shows iOS installation guidance outside standalone mode', async () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('iPhone');

    render(<PwaInstallPrompt />);

    expect(await screen.findByText('home.install.iosGuidance')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'home.install.button' })).toBeNull();
  });
});
