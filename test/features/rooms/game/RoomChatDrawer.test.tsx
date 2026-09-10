import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { theme } from '../../../../src/app/theme';
import { RoomChatDrawer } from '../../../../src/features/rooms/game/RoomChatDrawer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const chakra = await importOriginal<typeof import('@chakra-ui/react')>();
  return { ...chakra, useBreakpointValue: () => 'end' };
});

describe('RoomChatDrawer', () => {
  it('shows loading only on the preset being sent', () => {
    render(
      <ChakraProvider value={theme}>
        <RoomChatDrawer
          messages={[]}
          players={[
            { id: 'me', wins: 0, matchScore: 0, displayName: 'Me' },
            { id: 'opponent', wins: 0, matchScore: 0, displayName: 'Opponent' },
          ]}
          myPlayerId="me"
          unreadCount={0}
          open
          isLoading
          isSending
          sendingPreset="GOOD_LUCK"
          isSendBlocked={false}
          onOpenChange={vi.fn()}
          onSend={vi.fn()}
        />
      </ChakraProvider>,
    );

    const sendingButton = screen
      .getAllByRole('button')
      .find((button) => button.hasAttribute('data-loading'));
    const idleButton = screen.getByRole('button', { name: 'room.chat.presets.WOW' });

    expect(sendingButton).toBeTruthy();
    expect(idleButton.hasAttribute('data-loading')).toBe(false);
    expect(sendingButton?.hasAttribute('disabled')).toBe(true);
    expect(idleButton.hasAttribute('disabled')).toBe(true);
  });
});
