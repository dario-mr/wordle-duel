import { Box, Heading, Input, Skeleton, Stack, Table, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { UsersSortField } from '../../admin/usersSorts';
import { SortHeaderButton } from './SortHeaderButton';
import {
  USERS_COL_WIDTHS,
  USERS_HEADER_FILTER_SLOT_HEIGHT,
  USERS_HEADER_GAP,
  USERS_HEADER_LABEL_SLOT_HEIGHT,
} from './usersTable.constants';

const NOOP_SORT_CHANGE = (field: UsersSortField) => {
  void field;
};

function FilterInputPlaceholder() {
  return (
    <Input
      height={USERS_HEADER_FILTER_SLOT_HEIGHT}
      size="sm"
      borderWidth="1px"
      borderColor="border.emphasized"
      bg="bg.panel"
      pointerEvents="none"
      readOnly
      value=""
      aria-hidden="true"
    />
  );
}

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
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.avatar} p={0}>
                <VStack align="stretch" gap={USERS_HEADER_GAP}>
                  <Box height={USERS_HEADER_LABEL_SLOT_HEIGHT} />
                  <Box height={USERS_HEADER_FILTER_SLOT_HEIGHT} />
                </VStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.fullName} p={0}>
                <VStack align="stretch" gap={USERS_HEADER_GAP} py={2} px={1}>
                  <SortHeaderButton
                    label={t('admin.users.columns.fullName')}
                    field="fullName"
                    sort={null}
                    onSortChange={NOOP_SORT_CHANGE}
                  />
                  <FilterInputPlaceholder />
                </VStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.displayName} p={0}>
                <VStack align="stretch" gap={USERS_HEADER_GAP} py={2} px={1}>
                  <SortHeaderButton
                    label={t('admin.users.columns.displayName')}
                    field="displayName"
                    sort={null}
                    onSortChange={NOOP_SORT_CHANGE}
                  />
                  <FilterInputPlaceholder />
                </VStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.email} p={0}>
                <VStack align="stretch" gap={USERS_HEADER_GAP} py={2} px={1}>
                  <SortHeaderButton
                    label={t('admin.users.columns.email')}
                    field="email"
                    sort={null}
                    onSortChange={NOOP_SORT_CHANGE}
                  />
                  <FilterInputPlaceholder />
                </VStack>
              </Table.ColumnHeader>
              <Table.ColumnHeader truncate width={USERS_COL_WIDTHS.joined} p={0}>
                <VStack align="stretch" gap={USERS_HEADER_GAP}>
                  <SortHeaderButton
                    label={t('admin.users.columns.joined')}
                    field="createdOn"
                    sort={null}
                    onSortChange={NOOP_SORT_CHANGE}
                  />
                  <Box height={USERS_HEADER_FILTER_SLOT_HEIGHT} />
                </VStack>
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
                  <Skeleton height="18px" width="70%" borderRadius="md" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="18px" width="85%" borderRadius="md" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton height="18px" width="70%" borderRadius="md" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
