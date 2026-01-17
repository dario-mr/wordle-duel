import { Box, NativeSelect, Text } from '@chakra-ui/react';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '../../../state/themeStore';

interface Props {
  themeMode: ThemeMode;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export function ThemeSelect({ themeMode, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Box w="full">
      <Text mb={2}>{t('common.theme')}</Text>
      <NativeSelect.Root maxW="200px">
        <NativeSelect.Field value={themeMode} onChange={onChange} aria-label={t('common.theme')}>
          <option value="light">{t('common.light')}</option>
          <option value="dark">{t('common.dark')}</option>
        </NativeSelect.Field>
      </NativeSelect.Root>
    </Box>
  );
}
