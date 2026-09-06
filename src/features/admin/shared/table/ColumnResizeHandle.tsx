import { Box } from '@chakra-ui/react';
import type { Header, ReactTable, RowData } from '@tanstack/react-table';
import type { KeyboardEvent } from 'react';
import { adminTableFeatures } from './features';

export function ColumnResizeHandle<TData extends RowData>({
  header,
  table,
  label,
}: {
  header: Header<typeof adminTableFeatures, TData>;
  table: ReactTable<typeof adminTableFeatures, TData>;
  label: string;
}) {
  const minWidth = header.column.columnDef.minSize ?? 20;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === 'ArrowLeft' ? -16 : event.key === 'ArrowRight' ? 16 : 0;
    if (!delta) {
      return;
    }

    event.preventDefault();
    table.setColumnSizing((current) => ({
      ...current,
      [header.column.id]: Math.max(minWidth, header.column.getSize() + delta),
    }));
  };

  return (
    <Box
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuenow={header.column.getSize()}
      tabIndex={0}
      position="absolute"
      top={0}
      right="-3px"
      bottom={0}
      width="6px"
      cursor="col-resize"
      touchAction="none"
      zIndex={1}
      _hover={{ bg: 'border.info' }}
      _focusVisible={{ bg: 'border.info', outline: 'none' }}
      onMouseDown={(event) => {
        header.getResizeHandler()(event);
      }}
      onTouchStart={(event) => {
        header.getResizeHandler()(event);
      }}
      onKeyDown={handleKeyDown}
    />
  );
}
