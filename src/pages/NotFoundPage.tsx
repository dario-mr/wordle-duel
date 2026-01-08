import { Heading, Stack, Text } from '@chakra-ui/react';

export function NotFoundPage() {
  return (
    <Stack gap={4}>
      <Heading size="lg">404</Heading>
      <Text>Page not found.</Text>
    </Stack>
  );
}
