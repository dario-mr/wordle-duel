import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoundTitle } from '../../../../src/features/rooms/shared/RoundTitle';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../../src/features/rooms/shared/Pill', () => ({
  Pill: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../../src/features/rooms/shared/RoomLanguageFlag', () => ({
  RoomLanguageFlag: () => <span>room-language-flag</span>,
}));

describe('RoundTitle', () => {
  it('shows only room status in status-only mode', () => {
    render(<RoundTitle roomStatus="IN_PROGRESS" statusOnly />);

    expect(screen.getByText('room.status.inProgress')).toBeTruthy();
    expect(screen.queryByText('room.round.title')).toBeNull();
    expect(screen.queryByText('room-language-flag')).toBeNull();
  });
});
