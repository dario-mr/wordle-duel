import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../api/types';

export function RoomLanguageFlag(props: { language: Language }) {
  const { t } = useTranslation();

  const getRoomLanguageLabel = (language: Language) => {
    const normalized = language.trim().toLowerCase();
    return t(`roomLanguage.${normalized}`, {
      defaultValue: t(`locales.${normalized}`, { defaultValue: language }),
    });
  };

  const languageToFlagEmoji = (language: Language): string => {
    const code = language.toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
      return '🌐';
    }

    // Regional indicator symbols start at 0x1F1E6 ('A')
    const first = 0x1f1e6 + (code.charCodeAt(0) - 65);
    const second = 0x1f1e6 + (code.charCodeAt(1) - 65);

    return String.fromCodePoint(first, second);
  };

  const label = getRoomLanguageLabel(props.language);
  const flagEmoji = languageToFlagEmoji(props.language);

  return (
    <Box
      as="span"
      display="inline-block"
      lineHeight="1"
      role="img"
      aria-label={label}
      title={label}
    >
      {flagEmoji}
    </Box>
  );
}
