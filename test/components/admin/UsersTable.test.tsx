import { fireEvent, render, screen } from '@testing-library/react';
import type {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  TouchEventHandler,
  PointerEventHandler,
  ReactNode,
} from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminUserDto } from '../../../src/api/types';
import { UsersTable } from '../../../src/components/admin/UsersTable';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { column?: string }) =>
      options?.column ? `Resize ${options.column} column` : key.split('.').at(-1),
  }),
}));

vi.mock('@chakra-ui/react', () => {
  const childrenOnly = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Box = ({
    children,
    role,
    tabIndex,
    onPointerDown,
    onKeyDown,
    onMouseDown,
    onTouchStart,
    'aria-label': ariaLabel,
  }: {
    children?: ReactNode;
    role?: string;
    tabIndex?: number;
    onPointerDown?: PointerEventHandler<HTMLDivElement>;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
    onMouseDown?: MouseEventHandler<HTMLDivElement>;
    onTouchStart?: TouchEventHandler<HTMLDivElement>;
    'aria-label'?: string;
  }) => (
    <div
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
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
    'aria-label': ariaLabel,
  }: {
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
    'aria-label'?: string;
  }) => <input value={value} onChange={onChange} onKeyDown={onKeyDown} aria-label={ariaLabel} />;

  return {
    Avatar: {
      Root: childrenOnly,
      Image: ({ alt }: { alt?: string }) => <img alt={alt} />,
      Fallback: childrenOnly,
    },
    Box,
    Button,
    Input,
    Table: {
      Root: ({ children }: { children?: ReactNode }) => <table>{children}</table>,
      Header: ({ children }: { children?: ReactNode }) => <thead>{children}</thead>,
      Row: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
      ColumnHeader: ({ children }: { children?: ReactNode }) => <th>{children}</th>,
      Body: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
      Cell: ({ children }: { children?: ReactNode }) => <td>{children}</td>,
    },
    VStack: childrenOnly,
  };
});

const user: AdminUserDto = {
  id: 'user-1',
  email: 'alice@example.com',
  fullName: 'Alice Example',
  displayName: 'Alice',
  pictureUrl: null,
  createdOn: '2026-01-01T00:00:00Z',
};

describe('UsersTable', () => {
  it('resizes a column by dragging its divider and respects the minimum width', () => {
    render(
      <UsersTable
        users={[user]}
        sort={null}
        onSortChange={vi.fn()}
        filters={{ fullName: '', displayName: '', email: '' }}
        onFilterValueChange={vi.fn()}
        onFilterApply={vi.fn()}
      />,
    );

    const handle = screen.getByRole('separator', { name: 'Resize email column' });
    const header = handle.parentElement;
    expect(header).not.toBeNull();
    Object.defineProperty(header, 'getBoundingClientRect', { value: () => ({ width: 200 }) });

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: -1000 });

    expect(document.querySelectorAll('col')[3].style.width).toBe('160px');
  });
});
