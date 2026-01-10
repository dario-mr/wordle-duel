import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <Stack gap={2} align="center" justify="center" textAlign="center">
      <Heading size="lg">404</Heading>
      <Text>{t('notFound.message')}</Text>
    </Stack>
  );
}
