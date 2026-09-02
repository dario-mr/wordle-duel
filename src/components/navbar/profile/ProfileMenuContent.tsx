import { Box, Button, Flex, Separator, Stack, Text } from '@chakra-ui/react';
import {
  ChevronRight,
  FileText,
  Globe,
  LogOut,
  type LucideIcon,
  Moon,
  UserSearch,
} from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserMeDto } from '../../../api/types';
import type { UiLocale } from '../../../i18n/resources';
import { useLocaleStore } from '../../../state/localeStore';
import { type ThemeMode, useThemeStore } from '../../../state/themeStore';
import { LanguageSelect } from './LanguageSelect';
import { ThemeSelect } from './ThemeSelect';

const PROFILE_ENTRY_OPACITY = 0.85;
const PROFILE_ICON_SIZE = 22;
const PROFILE_CHEVRON_SIZE = 20;
const PROFILE_ICON_STROKE_WIDTH = 1.6;

interface ProfileMenuContentProps {
  me: UserMeDto | null | undefined;
  logoutPending: boolean;
  onUsersClick: () => void;
  onLegalClick: () => void;
  onLogoutClick: () => void;
}

export function ProfileMenuContent({
  me,
  logoutPending,
  onUsersClick,
  onLegalClick,
  onLogoutClick,
}: ProfileMenuContentProps) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const themeMode = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const isLoggedIn = Boolean(me);

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as UiLocale);
  };

  const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeMode);
  };

  return (
    <Stack gap={0} w="full">
      <Separator borderColor="border.divider" />
      <Stack gap={0} py={1} w="full">
        <ProfileSelectRow
          icon={Globe}
          label={t('profile.uiLanguage')}
          value={t(`locales.${locale}`)}
        >
          <LanguageSelect overlay locale={locale} onChange={handleLocaleChange} />
        </ProfileSelectRow>
        <ProfileSelectRow icon={Moon} label={t('common.theme')} value={t(`common.${themeMode}`)}>
          <ThemeSelect overlay themeMode={themeMode} onChange={handleThemeChange} />
        </ProfileSelectRow>
      </Stack>

      <Separator borderColor="border.divider" />
      <Stack gap={0} py={1} w="full">
        {isLoggedIn && me?.roles.includes('ADMIN') && (
          <ProfileActionRow
            icon={UserSearch}
            label={t('admin.users.navLink')}
            onClick={onUsersClick}
          />
        )}
        <ProfileActionRow icon={FileText} label={t('profile.legal')} onClick={onLegalClick} />
      </Stack>

      {isLoggedIn && (
        <>
          <Separator borderColor="border.divider" />
          <Stack gap={0} py={1} w="full">
            <ProfileActionRow
              icon={LogOut}
              label={t('profile.logout')}
              color="fg.error"
              showChevron={false}
              disabled={logoutPending}
              onClick={onLogoutClick}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
}

function ProfileSelectRow({
  icon: RowIcon,
  label,
  value,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <Box position="relative" w="full">
      <Flex align="center" gap={3} minH="2.75rem" px={2} py={2} pointerEvents="none" color="fg">
        <RowIcon
          size={PROFILE_ICON_SIZE}
          strokeWidth={PROFILE_ICON_STROKE_WIDTH}
          opacity={PROFILE_ENTRY_OPACITY}
          aria-hidden="true"
        />
        <Text flex="1" opacity={PROFILE_ENTRY_OPACITY}>
          {label}
        </Text>
        <Text color="fg.muted">{value}</Text>
        <ChevronRight
          size={PROFILE_CHEVRON_SIZE}
          strokeWidth={PROFILE_ICON_STROKE_WIDTH}
          opacity={PROFILE_ENTRY_OPACITY}
          aria-hidden="true"
        />
      </Flex>
      {children}
    </Box>
  );
}

function ProfileActionRow({
  icon: RowIcon,
  label,
  onClick,
  color = 'fg',
  showChevron = true,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
  showChevron?: boolean;
  disabled?: boolean;
}) {
  const contentOpacity = color === 'fg' ? PROFILE_ENTRY_OPACITY : undefined;

  return (
    <Button
      type="button"
      variant="plain"
      w="full"
      h="auto"
      minH="2.75rem"
      px={2}
      py={2}
      justifyContent="flex-start"
      gap={3}
      color={color}
      fontWeight="normal"
      disabled={disabled}
      onClick={onClick}
      transition="background-color 0.2s ease, color 0.2s ease"
      _hover={{ bg: 'bg.mutedCard', color }}
    >
      <RowIcon
        size={PROFILE_ICON_SIZE}
        strokeWidth={PROFILE_ICON_STROKE_WIDTH}
        opacity={contentOpacity}
        aria-hidden="true"
      />
      <Text flex="1" textAlign="start" opacity={contentOpacity}>
        {label}
      </Text>
      {showChevron && (
        <ChevronRight
          size={PROFILE_CHEVRON_SIZE}
          strokeWidth={PROFILE_ICON_STROKE_WIDTH}
          opacity={contentOpacity}
          aria-hidden="true"
        />
      )}
    </Button>
  );
}
