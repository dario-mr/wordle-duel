import { Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../shared/api/errors';
import { PrimaryButton } from '../../shared/ui/BrandButton';
import { ErrorAlert } from '../../shared/ui/ErrorAlert';

export function AuthErrorAlert({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <Stack gap={3}>
      <ErrorAlert title={t('auth.errorTitle')} message={getErrorMessage(error)} />
      <PrimaryButton type="button" onClick={onRetry}>
        {t('common.retry')}
      </PrimaryButton>
    </Stack>
  );
}
