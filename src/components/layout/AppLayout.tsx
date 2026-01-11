import { Outlet } from 'react-router-dom';
import { Box, Container, Flex } from '@chakra-ui/react';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box as="main" flex="1">
        <Container maxW={{ md: '48rem' }} py={3} px={2}>
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
}
