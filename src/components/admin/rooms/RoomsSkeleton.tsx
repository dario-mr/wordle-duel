import { Box, Button, Heading, Skeleton, Stack, Table, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function RoomsSkeleton() {
  const { t } = useTranslation();

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.rooms.title')}
      </Heading>
      <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
        <Table.Root minW="60rem">
          <Table.Header>
            <Table.Row bg="bg.mutedCard">
              {[
                { column: 'status', filterable: true },
                { column: 'roomId', filterable: true },
                { column: 'players', filterable: true },
                { column: 'scores', filterable: false },
                { column: 'rounds', filterable: true },
                { column: 'language', filterable: true },
                { column: 'createdAt', filterable: false },
                { column: 'lastUpdatedAt', filterable: false },
              ].map(({ column, filterable }) => (
                <Table.ColumnHeader key={column} p={0}>
                  <VStack align="stretch" gap={1} py={2} px={1} minH="5.5rem">
                    {filterable ? (
                      <Button variant="ghost" w="full" justifyContent="flex-start" px={2}>
                        {t(`admin.rooms.columns.${column}`)}
                      </Button>
                    ) : (
                      <Text fontSize="sm" fontWeight="medium">
                        {t(`admin.rooms.columns.${column}`)}
                      </Text>
                    )}
                    {filterable ? <Skeleton height="32px" /> : <Box height="32px" />}
                  </VStack>
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 6 }).map((_, index) => (
              <Table.Row key={index}>
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <Table.Cell key={cellIndex}>
                    <Skeleton height="1.25rem" width={cellIndex === 2 ? '8rem' : '5rem'} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
