import { NativeSelect } from '@chakra-ui/react';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '../../../state/themeStore';

interface Props {
  themeMode: ThemeMode;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  overlay?: boolean;
}

export function ThemeSelect({ themeMode, onChange, overlay = false }: Props) {
  const { t } = useTranslation();

  return (
    <NativeSelect.Root
      w={overlay ? 'full' : 'auto'}
      h={overlay ? 'full' : undefined}
      position={overlay ? 'absolute' : undefined}
      inset={overlay ? 0 : undefined}
      zIndex={overlay ? 1 : undefined}
      opacity={overlay ? 0 : undefined}
    >
      <NativeSelect.Field
        value={themeMode}
        onChange={onChange}
        aria-label={t('common.theme')}
        w={overlay ? 'full' : undefined}
        h={overlay ? 'full' : undefined}
        cursor={overlay ? 'pointer' : undefined}
      >
        <option value="light">{t('common.light')}</option>
        <option value="dark">{t('common.dark')}</option>
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
