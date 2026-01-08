import { Box, Flex, Heading } from '@chakra-ui/react';

export function Navbar() {
  return (
    <Box as="header" borderBottomWidth="1px">
      <Flex maxW="container.md" mx="auto" py={4} px={4} align="center">
        <Heading size="md">Wordle Duel</Heading>
      </Flex>
    </Box>
  );
}
