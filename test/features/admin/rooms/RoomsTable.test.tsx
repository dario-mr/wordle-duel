import { fireEvent, render, screen } from '@testing-library/react';
import type { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_ADMIN_ROOMS_FILTERS } from '../../../../src/features/admin/rooms/filters';
import { RoomsTable } from '../../../../src/features/admin/rooms/RoomsTable';
import type { AdminRoomDto } from '../../../../src/features/admin/rooms/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.split('.').at(-1) ?? key }),
}));

vi.mock('../../../../src/features/rooms/shared/RoundTitle', () => ({
  RoundTitle: () => <span>status</span>,
}));

vi.mock('@chakra-ui/react', () => {
  const childrenOnly = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Button = ({
    children,
    onClick,
  }: {
    children?: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
  const Input = ({
    value,
    onChange,
    onKeyDown,
    type,
    'aria-label': ariaLabel,
  }: {
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
    type?: string;
    'aria-label'?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type={type}
      aria-label={ariaLabel}
    />
  );

  return {
    Box: childrenOnly,
    Button,
    Input,
    NativeSelect: {
      Root: childrenOnly,
      Field: ({
        children,
        value,
        onChange,
        'aria-label': ariaLabel,
      }: {
        children?: ReactNode;
        value?: string;
        onChange?: ChangeEventHandler<HTMLSelectElement>;
        'aria-label'?: string;
      }) => (
        <select value={value} onChange={onChange} aria-label={ariaLabel}>
          {children}
        </select>
      ),
    },
    Stack: childrenOnly,
    Table: {
      Root: ({ children }: { children?: ReactNode }) => <table>{children}</table>,
      Header: ({ children }: { children?: ReactNode }) => <thead>{children}</thead>,
      Row: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
      ColumnHeader: ({ children }: { children?: ReactNode }) => <th>{children}</th>,
      Body: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
      Cell: ({ children }: { children?: ReactNode }) => <td>{children}</td>,
    },
    Text: childrenOnly,
    VStack: childrenOnly,
  };
});

const room: AdminRoomDto = {
  id: 'room-1',
  language: 'IT',
  configuredRounds: 5,
  status: 'WAITING_FOR_PLAYERS',
  players: [],
  rounds: [],
  createdAt: '2026-01-01T00:00:00Z',
  lastUpdatedAt: '2026-01-01T00:00:00Z',
};

describe('RoomsTable', () => {
  it('keeps an unapplied text filter draft and focus across parent rerenders', () => {
    const onFilterApply = vi.fn();
    const props = {
      rooms: [room],
      sort: null,
      onSortChange: vi.fn(),
      filters: EMPTY_ADMIN_ROOMS_FILTERS,
      onFilterChange: vi.fn(),
      onFilterApply,
      onOpenRoom: vi.fn(),
    };
    const { rerender } = render(<RoomsTable {...props} />);
    const input = screen.getByRole('textbox', { name: 'roomId' });

    input.focus();
    fireEvent.change(input, { target: { value: ' room-1 ' } });
    rerender(<RoomsTable {...props} filters={{ ...props.filters }} />);

    expect(screen.getByRole('textbox', { name: 'roomId' })).toBe(input);
    expect(document.activeElement).toBe(input);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onFilterApply).toHaveBeenCalledWith({ ...props.filters, roomId: ' room-1 ' });
  });
});
