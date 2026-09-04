import { Outlet } from 'react-router-dom';
import { Box, Container, Flex } from '@chakra-ui/react';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="bg"
      position="relative"
      overflow="hidden"
      isolation="isolate"
    >
      <Box aria-hidden className="background-letters" />
      <Navbar />
      <Box as="main" flex="1" pb={{ base: '3rem', md: 0 }}>
        <Container maxW={{ md: '50rem' }} py={4} px={4}>
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
}
