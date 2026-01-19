import { Box, HStack, Skeleton, VStack } from '@chakra-ui/react';

export const RoomSkeleton = () => {
  const rows = 6;
  const cols = 5;
  const keySize = '3.25rem';

  return (
    <VStack w="full" gap="5" align="stretch">
      {/* Title */}
      <Box>
        <Skeleton height="20px" width="220px" mx="auto" borderRadius="md" />
      </Box>
      {/* Score / status row */}
      <HStack justify="space-between" align="start">
        {/* Left side (Me) */}
        <VStack align="start" gap="2">
          <Skeleton height="18px" width="50px" borderRadius="md" />
          <Skeleton height="18px" width="70px" borderRadius="md" />
          <Skeleton height="18px" width="100px" borderRadius="md" />
        </VStack>

        {/* Right side (Opponent) */}
        <VStack align="end" gap="2">
          <Skeleton height="18px" width="50px" borderRadius="md" />
          <Skeleton height="18px" width="70px" borderRadius="md" />
          <Skeleton height="18px" width="100px" borderRadius="md" />
        </VStack>
      </HStack>

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
