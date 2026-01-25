import { Box, Skeleton, Stack, VStack } from '@chakra-ui/react';

export function MyRoomsSkeleton() {
  const cards = 3;

  return (
    <Stack gap={4} minH="50vh">
      <Box>
        <Skeleton height="24px" width="180px" mx="auto" borderRadius="md" />
      </Box>

      <VStack gap={3} align="stretch">
        {Array.from({ length: cards }).map((_, idx) => (
          <Box key={idx} borderRadius="xl" borderWidth="1px" px={4} py={5}>
            <Stack gap={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={3}>
                <Skeleton height="20px" width="160px" borderRadius="md" />
                <Skeleton height="20px" width="64px" borderRadius="full" />
              </Box>

              <Skeleton height="14px" width="220px" borderRadius="md" opacity={0.7} />

              <Box my={2} borderTopWidth="1px" borderColor="border.emphasized" opacity={0.35} />

              <Stack gap={2}>
                <Box display="grid" gridTemplateColumns="auto 1fr auto" alignItems="center" gap={4}>
                  <Skeleton boxSize={6} borderRadius="full" />
                  <Skeleton height="16px" width="140px" borderRadius="md" />
                  <Skeleton height="16px" width="24px" borderRadius="md" />
                </Box>
                <Box display="grid" gridTemplateColumns="auto 1fr auto" alignItems="center" gap={4}>
                  <Skeleton boxSize={6} borderRadius="full" />
                  <Skeleton height="16px" width="140px" borderRadius="md" />
                  <Skeleton height="16px" width="24px" borderRadius="md" />
                </Box>
              </Stack>
            </Stack>
          </Box>
        ))}
      </VStack>
    </Stack>
  );
}
