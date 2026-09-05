import { Box, HStack, Skeleton, Stack } from '@chakra-ui/react';
import { Card } from '../common/Card';

export function MyRoomsSkeleton() {
  const cards = 3;

  return (
    <Stack gap={4}>
      <Skeleton height="28px" width="7rem" mx="auto" borderRadius="md" />

      <Stack gap={4}>
        {Array.from({ length: cards }).map((_, idx) => (
          <Card key={idx} borderRadius="3xl">
            <Stack gap={2} w="full">
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={3}>
                <Skeleton height="28px" width="160px" borderRadius="md" />
                <Skeleton height="24px" width="7rem" borderRadius="full" />
              </Box>

              <HStack gap={3} alignItems="center" flexWrap="wrap">
                <Skeleton height="20px" width="120px" borderRadius="md" opacity={0.7} />
                <Skeleton boxSize="24px" borderRadius="md" opacity={0.7} />
              </HStack>

              <Box my={2} borderTopWidth="1px" borderColor="border.divider" />

              <Stack gap={3}>
                <Box display="grid" gridTemplateColumns="auto 1fr auto" alignItems="center" gap={4}>
                  <Skeleton boxSize={6} borderRadius="full" />
                  <Skeleton height="24px" width="140px" borderRadius="md" />
                  <Skeleton height="24px" width="24px" borderRadius="md" />
                </Box>
                <Box display="grid" gridTemplateColumns="auto 1fr auto" alignItems="center" gap={4}>
                  <Skeleton boxSize={6} borderRadius="full" />
                  <Skeleton height="24px" width="140px" borderRadius="md" />
                  <Skeleton height="24px" width="24px" borderRadius="md" />
                </Box>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
