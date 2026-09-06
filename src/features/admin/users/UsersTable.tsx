import { Avatar, Box, Table, VStack } from '@chakra-ui/react';
import { createColumnHelper, flexRender, useTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UsersFilterField, UsersFilters } from './filters';
import type { UsersSort, UsersSortField } from './sorts';
import type { AdminUserDto } from './types';
import { ColumnResizeHandle } from '../shared/table/ColumnResizeHandle';
import { adminTableFeatures } from '../shared/table/features';
import { SortHeaderButton } from '../shared/table/SortHeaderButton';
import { FilterHeader } from './FilterHeader';
import {
  USERS_COLUMN_SIZING,
  USERS_HEADER_FILTER_SLOT_HEIGHT,
  USERS_HEADER_GAP,
  USERS_HEADER_LABEL_SLOT_HEIGHT,
} from './usersTable.constants';

interface AdminUsersTableProps {
  users: AdminUserDto[];
  sort: UsersSort;
  onSortChange: (field: UsersSortField) => void;
  filters: UsersFilters;
  onFilterValueChange: (field: UsersFilterField, value: string) => void;
  onFilterApply: () => void;
}

const columnHelper = createColumnHelper<typeof adminTableFeatures, AdminUserDto>();
const USERS_TITLE_COLUMN_IDS = new Set(['fullName', 'displayName', 'email']);
type UsersColumn = 'fullName' | 'displayName' | 'email' | 'joined';

function HeaderSpacer() {
  return <Box height={USERS_HEADER_FILTER_SLOT_HEIGHT} />;
}

function HeaderLabelSpacer() {
  return <Box height={USERS_HEADER_LABEL_SLOT_HEIGHT} />;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();
}

export function UsersTable({
  users,
  sort,
  onSortChange,
  filters,
  onFilterValueChange,
  onFilterApply,
}: AdminUsersTableProps) {
  const { t } = useTranslation();
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: 'avatar',
          header: () => (
            <VStack align="stretch" gap={USERS_HEADER_GAP}>
              <HeaderLabelSpacer />
              <HeaderSpacer />
            </VStack>
          ),
          cell: ({ row }) => (
            <Avatar.Root size="sm" colorPalette="teal">
              {row.original.pictureUrl && (
                <Avatar.Image src={row.original.pictureUrl} alt={row.original.fullName} />
              )}
              <Avatar.Fallback>{getInitials(row.original.fullName)}</Avatar.Fallback>
            </Avatar.Root>
          ),
          ...USERS_COLUMN_SIZING.avatar,
          enableResizing: false,
        }),
        columnHelper.accessor('fullName', {
          header: () => (
            <FilterHeader
              label={t('admin.users.columns.fullName')}
              field="fullName"
              value={filters.fullName}
              sort={sort}
              onSortChange={onSortChange}
              onFilterValueChange={onFilterValueChange}
              onFilterApply={onFilterApply}
            />
          ),
          cell: (info) => info.getValue(),
          ...USERS_COLUMN_SIZING.fullName,
        }),
        columnHelper.accessor('displayName', {
          header: () => (
            <FilterHeader
              label={t('admin.users.columns.displayName')}
              field="displayName"
              value={filters.displayName}
              sort={sort}
              onSortChange={onSortChange}
              onFilterValueChange={onFilterValueChange}
              onFilterApply={onFilterApply}
            />
          ),
          cell: (info) => info.getValue(),
          ...USERS_COLUMN_SIZING.displayName,
        }),
        columnHelper.accessor('email', {
          header: () => (
            <FilterHeader
              label={t('admin.users.columns.email')}
              field="email"
              value={filters.email}
              sort={sort}
              onSortChange={onSortChange}
              onFilterValueChange={onFilterValueChange}
              onFilterApply={onFilterApply}
            />
          ),
          cell: (info) => info.getValue(),
          ...USERS_COLUMN_SIZING.email,
        }),
        columnHelper.accessor('createdOn', {
          header: () => (
            <VStack align="stretch" gap={USERS_HEADER_GAP}>
              <SortHeaderButton
                label={t('admin.users.columns.joined')}
                field="createdOn"
                sort={sort}
                onSortChange={onSortChange}
              />
              <HeaderSpacer />
            </VStack>
          ),
          cell: (info) => new Date(info.getValue()).toLocaleDateString(),
          ...USERS_COLUMN_SIZING.joined,
        }),
      ]),
    [
      filters.displayName,
      filters.email,
      filters.fullName,
      onFilterApply,
      onFilterValueChange,
      onSortChange,
      sort,
      t,
    ],
  );

  const table = useTable({
    features: adminTableFeatures,
    columns,
    data: users,
    columnResizeMode: 'onChange',
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
  });
  const resizeLabels: Record<UsersColumn, string> = {
    fullName: t('admin.users.columns.fullName'),
    displayName: t('admin.users.columns.displayName'),
    email: t('admin.users.columns.email'),
    joined: t('admin.users.columns.joined'),
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" overflowX="auto" overflowY="hidden">
      <Table.Root tableLayout="fixed" width="full">
        <colgroup>
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: `${String(column.getSize())}px` }} />
          ))}
        </colgroup>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} bg="bg.mutedCard">
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id} truncate p={0} position="relative">
                  {!header.isPlaceholder &&
                    flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanResize() && (
                    <ColumnResizeHandle
                      header={header}
                      table={table}
                      label={resizeLabels[header.column.id as UsersColumn]}
                    />
                  )}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getAllCells().map((cell) => {
                const title = USERS_TITLE_COLUMN_IDS.has(cell.column.id)
                  ? String(cell.getValue())
                  : undefined;

                return (
                  <Table.Cell key={cell.id} truncate={title !== undefined} title={title}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
