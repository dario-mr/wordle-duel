import { Box, Button, Input, NativeSelect, Stack, Table, Text, VStack } from '@chakra-ui/react';
import {
  columnResizingFeature,
  columnSizingFeature,
  createColumnHelper,
  flexRender,
  type Header,
  type ReactTable,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminRoomDto, RoomStatus } from '../../../api/types';
import type { AdminRoomsSort, AdminRoomsSortField } from '../../../admin/roomsSorts';
import { LANGUAGE_OPTIONS } from '../../../constants';
import { ADMIN_ROOM_STATUS_OPTIONS, type AdminRoomsFilters } from '../../../admin/roomsFilters';
import { roomStatusTextKey } from '../../../utils/roomStatusText';
import { RoomStatusBadge } from './RoomStatusBadge';

const features = tableFeatures({ columnSizingFeature, columnResizingFeature });
const columnHelper = createColumnHelper<typeof features, AdminRoomDto>();

type FilterOption = readonly [string, string];
type RoomsColumn =
  'status' | 'id' | 'players' | 'scores' | 'rounds' | 'language' | 'createdAt' | 'lastUpdatedAt';

interface ColumnResizeHandleProps {
  header: Header<typeof features, AdminRoomDto>;
  table: ReactTable<typeof features, AdminRoomDto>;
  label: string;
}

function ColumnResizeHandle({ header, table, label }: ColumnResizeHandleProps) {
  const minWidth = header.column.columnDef.minSize ?? 20;
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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

export function RoomsTable(props: {
  rooms: AdminRoomDto[];
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
  filters: AdminRoomsFilters;
  onFilterChange: (filters: AdminRoomsFilters) => void;
  onFilterApply: (filters?: AdminRoomsFilters) => void;
  onOpenRoom: (room: AdminRoomDto) => void;
}) {
  const { t } = useTranslation();
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('status', {
          header: () => (
            <SelectFilterHeader
              label={t('admin.rooms.columns.status')}
              field="status"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.statuses[0] ?? ''}
              options={[
                ['', ''],
                ...ADMIN_ROOM_STATUS_OPTIONS.map(
                  (status) => [status, t(roomStatusTextKey[status])] as const,
                ),
              ]}
              onChange={([value]) => {
                const nextFilters = {
                  ...props.filters,
                  statuses: value ? [value as RoomStatus] : [],
                };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => <RoomStatusBadge status={info.getValue()} />,
          size: 160,
          minSize: 150,
        }),
        columnHelper.accessor('id', {
          header: () => (
            <TextFilterHeader
              label={t('admin.rooms.columns.roomId')}
              field="roomId"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.roomId}
              onApply={(value) => {
                const nextFilters = { ...props.filters, roomId: value };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => (
            <Text title={info.getValue()} truncate>
              {info.getValue()}
            </Text>
          ),
          size: 180,
          minSize: 150,
        }),
        columnHelper.display({
          id: 'players',
          header: () => (
            <TextFilterHeader
              label={t('admin.rooms.columns.players')}
              field="players"
              sort={props.sort}
              onSortChange={props.onSortChange}
              filterLabel={t('admin.rooms.filters.playerSearch')}
              value={props.filters.playerSearch}
              onApply={(value) => {
                const nextFilters = { ...props.filters, playerSearch: value };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: ({ row }) => (
            <Stack gap={1}>
              {row.original.players.map((player) => (
                <Box key={player.id}>
                  <Text>{player.displayName ?? '—'}</Text>
                </Box>
              ))}
            </Stack>
          ),
          size: 190,
          minSize: 160,
        }),
        columnHelper.display({
          id: 'scores',
          header: () => <StaticHeader label={t('admin.rooms.columns.scores')} />,
          cell: ({ row }) => (
            <Stack gap={1}>
              {row.original.players.map((player) => (
                <Text key={player.id}>
                  {player.matchScore ?? '—'}{' '}
                  <Text as="span" fontSize="sm" color="fg" opacity={0.6}>
                    ({t('admin.rooms.wins', { count: player.wins })})
                  </Text>
                </Text>
              ))}
            </Stack>
          ),
          size: 120,
          minSize: 110,
        }),
        columnHelper.accessor('rounds', {
          header: () => (
            <SelectFilterHeader
              label={t('admin.rooms.columns.rounds')}
              field="rounds"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.rounds}
              options={[
                ['', ''],
                ['FIVE', t('admin.rooms.rounds.FIVE')],
                ['TEN', t('admin.rooms.rounds.TEN')],
                ['ENDLESS', t('admin.rooms.rounds.ENDLESS')],
              ]}
              onChange={([value]) => {
                const nextFilters = {
                  ...props.filters,
                  rounds: value as AdminRoomsFilters['rounds'],
                };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => t(`admin.rooms.rounds.${String(info.getValue())}`),
          size: 110,
          minSize: 100,
        }),
        columnHelper.accessor('language', {
          header: () => (
            <SelectFilterHeader
              label={t('admin.rooms.columns.language')}
              field="language"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.language}
              options={[
                ['', ''],
                ...LANGUAGE_OPTIONS.map((option) => [option.value, t(option.labelKey)] as const),
              ]}
              onChange={([value]) => {
                const nextFilters = {
                  ...props.filters,
                  language: value as AdminRoomsFilters['language'],
                };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => t(`roomLanguage.${info.getValue().toLowerCase()}`),
          size: 110,
          minSize: 100,
        }),
        columnHelper.accessor('createdAt', {
          header: () => (
            <DateFilterHeader
              label={t('admin.rooms.columns.createdAt')}
              field="createdAt"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.createdAt}
              onApply={(value) => {
                const nextFilters = { ...props.filters, createdAt: value };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => <RelativeTime value={info.getValue()} />,
          size: 150,
          minSize: 140,
        }),
        columnHelper.accessor('lastUpdatedAt', {
          header: () => (
            <DateFilterHeader
              label={t('admin.rooms.columns.lastUpdatedAt')}
              field="lastUpdatedAt"
              sort={props.sort}
              onSortChange={props.onSortChange}
              value={props.filters.lastUpdatedAt}
              onApply={(value) => {
                const nextFilters = { ...props.filters, lastUpdatedAt: value };
                props.onFilterChange(nextFilters);
                props.onFilterApply(nextFilters);
              }}
            />
          ),
          cell: (info) => <RelativeTime value={info.getValue()} />,
          size: 150,
          minSize: 140,
        }),
      ]),
    [props, t],
  );

  const table = useTable({
    features,
    columns,
    data: props.rooms,
    columnResizeMode: 'onChange',
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
  });

  const resizeLabels: Record<RoomsColumn, string> = {
    status: t('admin.rooms.columns.status'),
    id: t('admin.rooms.columns.roomId'),
    players: t('admin.rooms.columns.players'),
    scores: t('admin.rooms.columns.scores'),
    rounds: t('admin.rooms.columns.rounds'),
    language: t('admin.rooms.columns.language'),
    createdAt: t('admin.rooms.columns.createdAt'),
    lastUpdatedAt: t('admin.rooms.columns.lastUpdatedAt'),
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" overflowX="auto" overflowY="hidden">
      <Table.Root tableLayout="fixed" width="full" minW="70rem">
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
                      label={resizeLabels[header.column.id as RoomsColumn]}
                    />
                  )}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              tabIndex={0}
              cursor="pointer"
              aria-label={`${t('admin.rooms.columns.roomId')}: ${row.original.id}`}
              onClick={() => {
                props.onOpenRoom(row.original);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') {
                  return;
                }
                event.preventDefault();
                props.onOpenRoom(row.original);
              }}
              _hover={{ bg: 'bg.mutedCard' }}
              _focusVisible={{ outline: '2px solid', outlineColor: 'fg.primary' }}
            >
              {row.getAllCells().map((cell) => (
                <Table.Cell key={cell.id} verticalAlign="top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

function HeaderStack(props: { children: ReactNode }) {
  return (
    <VStack align="stretch" gap={1} py={2} px={1} minH="5.5rem">
      {props.children}
    </VStack>
  );
}

function SortHeaderButton(props: {
  label: string;
  field: AdminRoomsSortField;
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
}) {
  const indicator =
    props.sort?.field !== props.field ? '' : props.sort.direction === 'asc' ? ' ↑' : ' ↓';

  return (
    <Button
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      px={2}
      _hover={{ bg: 'bg.mutedCard' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: 'inset 0 0 0 2px var(--chakra-colors-border-info)',
      }}
      onClick={() => {
        props.onSortChange(props.field);
      }}
    >
      {props.label}
      {indicator}
    </Button>
  );
}

function SortableHeaderStack(props: {
  label: string;
  field: AdminRoomsSortField;
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
  children: ReactNode;
}) {
  return (
    <HeaderStack>
      <SortHeaderButton
        label={props.label}
        field={props.field}
        sort={props.sort}
        onSortChange={props.onSortChange}
      />
      {props.children}
    </HeaderStack>
  );
}

function StaticHeader({ label }: { label: string }) {
  return (
    <HeaderStack>
      <Text fontSize="sm" fontWeight="medium" truncate>
        {label}
      </Text>
      <Box height="32px" />
    </HeaderStack>
  );
}

function DateFilterHeader(props: {
  label: string;
  value: string;
  field: AdminRoomsSortField;
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
  onApply: (value: string) => void;
}) {
  return (
    <SortableHeaderStack
      label={props.label}
      field={props.field}
      sort={props.sort}
      onSortChange={props.onSortChange}
    >
      <Input
        type="date"
        value={props.value}
        onChange={(event) => {
          props.onApply(event.currentTarget.value);
        }}
        height="32px"
        size="sm"
        borderWidth="1px"
        borderColor="border.emphasized"
        bg="bg.panel"
        aria-label={props.label}
      />
    </SortableHeaderStack>
  );
}

function TextFilterHeader(props: {
  label: string;
  filterLabel?: string;
  value: string;
  field: AdminRoomsSortField;
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(props.value);
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    props.onApply(draft);
  };

  return (
    <SortableHeaderStack
      label={props.label}
      field={props.field}
      sort={props.sort}
      onSortChange={props.onSortChange}
    >
      <Input
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        height="32px"
        size="sm"
        borderWidth="1px"
        borderColor="border.emphasized"
        bg="bg.panel"
        aria-label={props.filterLabel ?? props.label}
      />
    </SortableHeaderStack>
  );
}

function SelectFilterHeader(props: {
  label: string;
  value: string;
  options: readonly FilterOption[];
  field: AdminRoomsSortField;
  sort: AdminRoomsSort;
  onSortChange: (field: AdminRoomsSortField) => void;
  onChange: (values: string[]) => void;
}) {
  return (
    <SortableHeaderStack
      label={props.label}
      field={props.field}
      sort={props.sort}
      onSortChange={props.onSortChange}
    >
      <NativeSelect.Root>
        <NativeSelect.Field
          value={props.value}
          aria-label={props.label}
          onChange={(event) => {
            props.onChange([event.currentTarget.value]);
          }}
        >
          {props.options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect.Field>
      </NativeSelect.Root>
    </SortableHeaderStack>
  );
}

function RelativeTime({ value }: { value: string }) {
  const [now] = useState(() => Date.now());
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <Text title={value}>{value}</Text>;
  }

  const seconds = Math.round((date.getTime() - now) / 1000);
  const absolute = date.toLocaleString();
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const amount = Math.abs(seconds) < 60 ? seconds : Math.round(seconds / 60);
  const unit: Intl.RelativeTimeFormatUnit = Math.abs(seconds) < 60 ? 'second' : 'minute';

  return (
    <time dateTime={value} title={absolute}>
      {relative.format(amount, unit)}
    </time>
  );
}
