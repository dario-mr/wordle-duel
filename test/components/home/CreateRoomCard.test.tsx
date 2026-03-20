import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateRoomCard } from '../../../src/components/home/CreateRoomCard';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('../../../src/query/roomQueries', () => ({
  useCreateRoomMutation: () => ({
    isPending: false,
    error: null,
    mutate: mocks.mutate,
  }),
}));

vi.mock('../../../src/api/errors', () => ({
  getErrorMessage: () => 'Create failed',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  NativeSelect: {
    Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Field: ({
      children,
      value,
      onChange,
      id,
    }: {
      children?: ReactNode;
      value?: string;
      onChange?: (event: { target: { value: string } }) => void;
      id?: string;
    }) => (
      <select
        id={id}
        aria-label="language"
        value={value}
        onChange={(e) => {
          onChange?.({ target: { value: e.currentTarget.value } });
        }}
      >
        {children}
      </select>
    ),
  },
  Stack: ({
    children,
    as,
    onSubmit,
  }: {
    children?: ReactNode;
    as?: 'form';
    onSubmit?: (event: { preventDefault: () => void }) => void;
  }) => {
    if (as === 'form') {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.({ preventDefault: () => undefined });
          }}
        >
          {children}
        </form>
      );
    }

    return <div>{children}</div>;
  },
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../src/components/common/BrandButton', () => ({
  PrimaryButton: ({ children }: { children?: ReactNode }) => (
    <button type="submit">{children}</button>
  ),
}));

vi.mock('../../../src/components/common/Card', () => ({
  Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../src/components/common/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

describe('CreateRoomCard', () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
  });

  it('submits the create room mutation and forwards success', () => {
    const onCreated = vi.fn();
    mocks.mutate.mockImplementation(
      (vars: { language: 'IT' }, options?: { onSuccess?: (room: { id: string }) => void }) => {
        expect(vars).toEqual({ language: 'IT' });
        options?.onSuccess?.({ id: 'room-1' });
      },
    );

    render(<CreateRoomCard onCreated={onCreated} />);
    const form = screen.getByRole('button').closest('form');
    expect(form).not.toBeNull();
    if (!form) {
      throw new Error('Expected create room form');
    }

    fireEvent.submit(form);

    expect(onCreated).toHaveBeenCalledWith('room-1');
  });
});
