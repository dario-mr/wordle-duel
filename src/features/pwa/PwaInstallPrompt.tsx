import { Button, Stack, Text } from '@chakra-ui/react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePwaInstall } from './usePwaInstall';

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, install, isIos, isStandalone } = usePwaInstall();
  const showIosGuidance = isIos && !isStandalone;

  if (!showIosGuidance && !canInstall) {
    return null;
  }

  return (
    <Stack align="center" gap={2} textAlign="center">
      {canInstall && (
        <Button
          type="button"
          bg="bg.card"
          color="fg"
          borderColor="border.muted"
          borderRadius="xl"
          gap={2}
          px={5}
          boxShadow="xs"
          _hover={{ bg: 'bg.panel', color: 'fg', borderColor: 'border.muted' }}
          onClick={install}
        >
          <Download size={17} aria-hidden="true" />
          {t('home.install.button')}
        </Button>
      )}
      {canInstall && (
        <Text color="fg.muted" fontSize="sm">
          {t('home.install.quickAccess')}
        </Text>
      )}
      {showIosGuidance && (
        <Text color="fg.muted" fontSize="sm" maxW="26rem">
          {t('home.install.iosGuidance')}
        </Text>
      )}
    </Stack>
  );
}
