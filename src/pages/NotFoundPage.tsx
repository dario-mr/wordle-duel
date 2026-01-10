import { Heading, Stack, Text } from '@chakra-ui/react';

export function NotFoundPage() {
  return (
    <Stack gap={2} align="center" justify="center" textAlign="center">
      <Heading size="lg">404</Heading>
      <Text>Page not found.</Text>
    </Stack>
  );
}
