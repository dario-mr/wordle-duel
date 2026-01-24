import { NativeSelect } from '@chakra-ui/react';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type { UiLocale } from '../../../i18n/resources';

interface Props {
  locale: UiLocale;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export function LanguageSelect({ locale, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <NativeSelect.Root w="auto">
      <NativeSelect.Field
        value={locale}
        onChange={onChange}
        aria-label={t('profile.uiLanguageAria')}
      >
        <option value="en">{t('locales.en')}</option>
        <option value="it">{t('locales.it')}</option>
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
