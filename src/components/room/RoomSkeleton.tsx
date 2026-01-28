import { Box, Grid, HStack, Skeleton, VStack } from '@chakra-ui/react';
import { Card } from '../common/Card';

export const RoomSkeleton = () => {
  const rows = 6;
  const cols = 5;
  const keySize = '3.25rem';

  return (
    <VStack w="full" gap="4" align="stretch">
      {/* Title */}
      <Box>
        <Skeleton height="20px" width="180px" mx="auto" borderRadius="md" />
      </Box>
      {/* Score / status row */}
      <Card
        borderColor="border.muted"
        bg="bg.mutedCard"
        borderLeftWidth="default"
        borderLeftColor="default"
        p={3}
      >
        <Grid w="100%" templateColumns="1fr auto 1fr" columnGap={10} alignItems="center">
          <VStack align="flex-start" gap={3} minW={0}>
            <Skeleton height="20px" width="100px" borderRadius="md" />
            <HStack gap={2} minW={0}>
              <Skeleton boxSize="6" borderRadius="full" />
              <Skeleton height="16px" width="50px" borderRadius="md" />
            </HStack>
          </VStack>

          <HStack justify="center" />

          <VStack align="flex-end" textAlign="right" gap={3} minW={0}>
            <Skeleton height="20px" width="100px" borderRadius="md" />
            <HStack gap={2} minW={0} justify="flex-end">
              <Skeleton boxSize="6" borderRadius="full" />
              <Skeleton height="16px" width="50px" borderRadius="md" />
            </HStack>
          </VStack>
        </Grid>
      </Card>

      {/* Board */}
      <VStack align="center">
        <VStack gap="1" align="center">
          {Array.from({ length: rows }).map((_, r) => (
            <HStack key={r} gap="1" justify="center">
              {Array.from({ length: cols }).map((__, c) => (
                <Skeleton key={`${String(r)}-${String(c)}`} boxSize={keySize} borderRadius="sm" />
              ))}
            </HStack>
          ))}
        </VStack>
      </VStack>

      {/* Keyboard skeleton */}
      <VStack w="full" align="stretch" gap="1.5">
        <Skeleton h="14" w="full" />
        <Box px="5">
          <Skeleton h="14" w="full" />
        </Box>
        <Skeleton h="14" w="full" />
      </VStack>
    </VStack>
  );
};
