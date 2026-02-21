import { Avatar, Box, Button, Table } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { AdminUserDto } from '../../api/types';

export type UsersSortField = 'fullName' | 'createdOn' | `email`;
export type UsersSortDirection = 'asc' | 'desc';
export type UsersSort = { field: UsersSortField; direction: UsersSortDirection } | null;

export const USERS_COL_WIDTHS = {
  avatar: '60px',
  fullName: '20%',
  displayName: '20%',
  email: '30%',
  joined: '120px',
} as const;

interface AdminUsersTableProps {
  users: AdminUserDto[];
  sort: UsersSort;
  onSortChange: (field: UsersSortField) => void;
}

interface SortHeaderButtonProps {
  label: string;
  field: UsersSortField;
  sort: UsersSort;
  onSortChange: (field: UsersSortField) => void;
}

function SortHeaderButton({ label, field, sort, onSortChange }: SortHeaderButtonProps) {
  const indicator = sort?.field !== field ? '' : sort.direction === 'asc' ? ' ↑' : ' ↓';

  return (
    <Button
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      px={3}
      onClick={() => {
        onSortChange(field);
      }}
    >
      {label}
      {indicator}
    </Button>
  );
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();
}

export function UsersTable({ users, sort, onSortChange }: AdminUsersTableProps) {
  const { t } = useTranslation();

  return (
    <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Table.Root tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.avatar} />
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.fullName} p={0}>
              <SortHeaderButton
                label={t('admin.users.columns.fullName')}
                field="fullName"
                sort={sort}
                onSortChange={onSortChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.displayName}>
              {t('admin.users.columns.displayName')}
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.email} p={0}>
              <SortHeaderButton
                label={t('admin.users.columns.email')}
                field="email"
                sort={sort}
                onSortChange={onSortChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.joined} p={0}>
              <SortHeaderButton
                label={t('admin.users.columns.joined')}
                field="createdOn"
                sort={sort}
                onSortChange={onSortChange}
              />
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
