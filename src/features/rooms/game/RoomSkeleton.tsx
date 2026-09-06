import { Box, Grid, GridItem, HStack, Skeleton, VStack } from '@chakra-ui/react';

export const RoomSkeleton = () => {
  const rows = 6;
  const cols = 5;
  const keySize = '3.25rem';
  const keyboardGridProps = {
    gap: { base: 0.5, md: 1 },
    justifyContent: 'center',
    templateColumns: 'repeat(20, 1fr)',
    w: '100%',
  } as const;
  const keyboardKeyProps = {
    h: 14,
    w: 'full',
    borderRadius: 'md',
  } as const;

  return (
    <VStack w="full" maxW="44rem" mx="auto" gap={5} align="stretch" pb={4}>
      {/* Round title and player stats */}
      <VStack gap={5} align="stretch">
        <Box display="flex" justifyContent="center">
          <Skeleton h="30px" w="8rem" borderRadius="full" />
        </Box>

        <Grid
          w="full"
          templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)"
          columnGap={2}
          alignItems="stretch"
          borderBottomWidth="1px"
          borderColor="border.divider"
          pb={4}
        >
          <VStack align="center" justify="center" gap={2} minW={0}>
            <Skeleton h="1.5rem" w="100px" borderRadius="md" />
          </VStack>

          <HStack
            justify="center"
            gap={2}
            px={6}
            borderLeftWidth="1px"
            borderRightWidth="1px"
            borderColor="border.divider"
          >
            <Skeleton h="2rem" w="2rem" borderRadius="md" />
            <Skeleton h="1.5rem" w="1.5rem" borderRadius="md" />
            <Skeleton h="2rem" w="2rem" borderRadius="md" />
          </HStack>

          <VStack align="center" justify="center" gap={1} minW={0}>
            <Skeleton h="1.5rem" w="100px" borderRadius="md" />
          </VStack>
        </Grid>
      </VStack>

      {/* Board */}
      <VStack gap={3} align="center">
        <VStack gap={1} align="center">
          {Array.from({ length: rows }).map((_, r) => (
            <HStack key={r} gap={1} justify="center">
              {Array.from({ length: cols }).map((__, c) => (
                <Skeleton key={`${String(r)}-${String(c)}`} boxSize={keySize} borderRadius="md" />
              ))}
            </HStack>
          ))}
        </VStack>
      </VStack>

      {/* Keyboard */}
      <VStack w="full" gap={3} align="stretch">
        <VStack w="full" maxW="36rem" mx="auto" gap={1.5} align="stretch">
          <Grid {...keyboardGridProps}>
            {Array.from({ length: 10 }).map((_, index) => (
              <GridItem key={index} colSpan={2}>
                <Skeleton {...keyboardKeyProps} />
              </GridItem>
            ))}
          </Grid>

          <Grid {...keyboardGridProps}>
            <GridItem colSpan={1} />
            {Array.from({ length: 9 }).map((_, index) => (
              <GridItem key={index} colSpan={2}>
                <Skeleton {...keyboardKeyProps} />
              </GridItem>
            ))}
            <GridItem colSpan={1} />
          </Grid>

          <Grid {...keyboardGridProps}>
            <GridItem colSpan={3}>
              <Skeleton {...keyboardKeyProps} />
            </GridItem>
            {Array.from({ length: 7 }).map((_, index) => (
              <GridItem key={index} colSpan={2}>
                <Skeleton {...keyboardKeyProps} />
              </GridItem>
            ))}
            <GridItem colSpan={3}>
              <Skeleton {...keyboardKeyProps} />
            </GridItem>
          </Grid>
        </VStack>
      </VStack>
    </VStack>
  );
};
