import { Avatar, Box, Table, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { UsersFilterField, UsersFilters } from '../../admin/usersFilters';
import type { UsersSort, UsersSortField } from '../../admin/usersSorts';
import type { AdminUserDto } from '../../api/types';
import { FilterHeader } from './FilterHeader';
import { SortHeaderButton } from './SortHeaderButton';
import {
  USERS_COL_WIDTHS,
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

  return (
    <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Table.Root tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.avatar} p={0}>
              <VStack align="stretch" gap={USERS_HEADER_GAP}>
                <HeaderLabelSpacer />
                <HeaderSpacer />
              </VStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.fullName} p={0}>
              <FilterHeader
                label={t('admin.users.columns.fullName')}
                field="fullName"
                value={filters.fullName}
                sort={sort}
                onSortChange={onSortChange}
                onFilterValueChange={onFilterValueChange}
                onFilterApply={onFilterApply}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.displayName} p={0}>
              <VStack align="stretch" gap={USERS_HEADER_GAP}>
                <Box
                  height={USERS_HEADER_LABEL_SLOT_HEIGHT}
                  display="flex"
                  alignItems="center"
                  px={2}
                >
                  {t('admin.users.columns.displayName')}
                </Box>
                <HeaderSpacer />
              </VStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.email} p={0}>
              <FilterHeader
                label={t('admin.users.columns.email')}
                field="email"
                value={filters.email}
                sort={sort}
                onSortChange={onSortChange}
                onFilterValueChange={onFilterValueChange}
                onFilterApply={onFilterApply}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.joined} p={0}>
              <VStack align="stretch" gap={USERS_HEADER_GAP}>
                <SortHeaderButton
                  label={t('admin.users.columns.joined')}
                  field="createdOn"
                  sort={sort}
                  onSortChange={onSortChange}
                />
                <HeaderSpacer />
              </VStack>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Avatar.Root size="sm" colorPalette="teal">
                  {user.pictureUrl && <Avatar.Image src={user.pictureUrl} alt={user.fullName} />}
                  <Avatar.Fallback>{getInitials(user.fullName)}</Avatar.Fallback>
                </Avatar.Root>
              </Table.Cell>
              <Table.Cell truncate title={user.fullName}>
                {user.fullName}
              </Table.Cell>
              <Table.Cell truncate title={user.displayName}>
                {user.displayName}
              </Table.Cell>
              <Table.Cell truncate title={user.email}>
                {user.email}
              </Table.Cell>
              <Table.Cell>{new Date(user.createdOn).toLocaleDateString()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
