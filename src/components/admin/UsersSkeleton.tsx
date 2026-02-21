import { Box, Heading, Skeleton, Stack, Table } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { USERS_COL_WIDTHS } from './UsersTable';

export function UsersSkeleton() {
  const { t } = useTranslation();

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.users.title')}
      </Heading>

      <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
        <Table.Root tableLayout="fixed">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.avatar} />
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.fullName}>
                {t('admin.users.columns.fullName')}
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.displayName}>
                {t('admin.users.columns.displayName')}
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.email}>
                {t('admin.users.columns.email')}
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.joined}>
                {t('admin.users.columns.joined')}
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <Skeleton boxSize={9} borderRadius="full" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="18px" width="80%" borderRadius="md" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="16px" width="70%" borderRadius="md" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="16px" width="85%" borderRadius="md" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="16px" width="70%" borderRadius="md" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
