import { NativeSelect } from '@chakra-ui/react';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type { UiLocale } from '../../../i18n/resources';

interface Props {
  locale: UiLocale;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  overlay?: boolean;
}

export function LanguageSelect({ locale, onChange, overlay = false }: Props) {
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
        value={locale}
        onChange={onChange}
        aria-label={t('profile.uiLanguage')}
        w={overlay ? 'full' : undefined}
        h={overlay ? 'full' : undefined}
        cursor={overlay ? 'pointer' : undefined}
      >
        <option value="en">{t('locales.en')}</option>
        <option value="it">{t('locales.it')}</option>
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
