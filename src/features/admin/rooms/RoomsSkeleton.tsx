import { Box, Button, Heading, Skeleton, Stack, Table, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  ROOMS_COLUMN_SIZING,
  ROOMS_HEADER_CONTROL_HEIGHTS,
  ROOMS_HEADER_MIN_HEIGHT,
  ROOMS_ROW_SKELETON_SIZES,
  ROOMS_STACK_GAP,
  ROOMS_TABLE_MIN_WIDTH,
} from './roomsTable.constants';

export function RoomsSkeleton() {
  const { t } = useTranslation();

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.rooms.title')}
      </Heading>
      <Box borderWidth="1px" borderRadius="xl" overflowX="auto" overflowY="hidden">
        <Table.Root tableLayout="fixed" width="full" minW={ROOMS_TABLE_MIN_WIDTH}>
          <colgroup>
            {Object.entries(ROOMS_COLUMN_SIZING).map(([column, { size }]) => (
              <col key={column} style={{ width: `${String(size)}px` }} />
            ))}
          </colgroup>
          <Table.Header>
            <Table.Row bg="bg.mutedCard">
              {[
                {
                  column: 'status',
                  filterable: true,
                  filterHeight: ROOMS_HEADER_CONTROL_HEIGHTS.select,
                },
                {
                  column: 'roomId',
                  filterable: true,
                  filterHeight: ROOMS_HEADER_CONTROL_HEIGHTS.text,
                },
                {
                  column: 'players',
                  filterable: true,
                  filterHeight: ROOMS_HEADER_CONTROL_HEIGHTS.text,
                },
                { column: 'scores', filterable: false },
                {
                  column: 'rounds',
                  filterable: true,
                  filterHeight: ROOMS_HEADER_CONTROL_HEIGHTS.select,
                },
                {
                  column: 'language',
                  filterable: true,
                  filterHeight: ROOMS_HEADER_CONTROL_HEIGHTS.select,
                },
                { column: 'createdAt', filterable: false },
                { column: 'lastUpdatedAt', filterable: false },
              ].map(({ column, filterable, filterHeight }) => (
                <Table.ColumnHeader key={column} p={0}>
                  <VStack
                    align="stretch"
                    gap={ROOMS_STACK_GAP}
                    py={2}
                    px={1}
                    minH={ROOMS_HEADER_MIN_HEIGHT}
                  >
                    {filterable ? (
                      <Button variant="ghost" w="full" justifyContent="flex-start" px={2}>
                        {t(`admin.rooms.columns.${column}`)}
                      </Button>
                    ) : (
                      <Text fontSize="sm" fontWeight="medium">
                        {t(`admin.rooms.columns.${column}`)}
                      </Text>
                    )}
                    {filterable ? (
                      <Skeleton height={filterHeight ?? ROOMS_HEADER_CONTROL_HEIGHTS.text} />
                    ) : (
                      <Box height={ROOMS_HEADER_CONTROL_HEIGHTS.text} />
                    )}
                  </VStack>
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 6 }).map((_, index) => (
              <RoomRowSkeleton key={index} />
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}

function RoomRowSkeleton() {
  const sizes = ROOMS_ROW_SKELETON_SIZES;

  return (
    <Table.Row>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.status.height} width={sizes.status.width} borderRadius="full" />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.lineHeight} width={sizes.id} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <SkeletonLines widths={sizes.players} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <SkeletonLines widths={sizes.scores} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.lineHeight} width={sizes.rounds} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.lineHeight} width={sizes.language} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.lineHeight} width={sizes.date} />
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Skeleton height={sizes.lineHeight} width={sizes.date} />
      </Table.Cell>
    </Table.Row>
  );
}

function SkeletonLines({ widths }: { widths: readonly string[] }) {
  return (
    <Stack gap={ROOMS_STACK_GAP}>
      {widths.map((width) => (
        <Skeleton key={width} height={ROOMS_ROW_SKELETON_SIZES.lineHeight} width={width} />
      ))}
    </Stack>
  );
}
