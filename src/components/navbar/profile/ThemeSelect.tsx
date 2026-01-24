import { NativeSelect } from '@chakra-ui/react';
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
    <NativeSelect.Root w="auto">
      <NativeSelect.Field value={themeMode} onChange={onChange} aria-label={t('common.theme')}>
        <option value="light">{t('common.light')}</option>
        <option value="dark">{t('common.dark')}</option>
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
