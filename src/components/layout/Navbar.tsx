import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react';
import { House, type LucideIcon, UserRound, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ProfilePopover } from '../navbar/profile/ProfilePopover.tsx';

const NAV_ICON_SIZE = 20;

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navItems = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/my-rooms', label: t('nav.rooms'), icon: Users },
  ];

  return (
    <>
      <Box as="header" borderBottomWidth="1px" borderColor="border.divider" position="relative">
        <Flex w="full" mx="auto" py={2} px={4} align="center" justify="space-between">
          <ChakraLink asChild display="inline-flex" alignItems="center" gap={2}>
            <RouterLink to="/">
              <Image
                src={`${import.meta.env.BASE_URL}header.png`}
                alt=""
                boxSize={{ base: '2.2rem', md: '2.5rem' }}
                objectFit="contain"
              />
              <Heading fontSize={{ base: 'lg', md: 'xl' }}>{t('app.name')}</Heading>
            </RouterLink>
          </ChakraLink>

          <Flex
            as="nav"
            display={{ base: 'none', md: 'flex' }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            align="stretch"
            h="full"
          >
            {navItems.map((item) => (
              <NavigationItem
                key={item.to}
                {...item}
                active={
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)
                }
              />
            ))}
          </Flex>

          <Box display={{ base: 'none', md: 'block' }}>
            <ProfilePopover />
          </Box>
        </Flex>
      </Box>

      <Flex
        as="nav"
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        insetInlineStart={0}
        bottom={0}
        zIndex="sticky"
        w="full"
        px={2}
        pt={1}
        pb="calc(env(safe-area-inset-bottom) + 0.25rem)"
        gap={1}
        bg="bg.panel"
        borderTopWidth="1px"
        borderColor="border.divider"
      >
        {navItems.map((item) => (
          <NavigationItem
            key={item.to}
            {...item}
            active={
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            }
          />
        ))}
        <Box flex="1" display="flex">
          <ProfilePopover
            mobile
            trigger={(pictureUrl) => (
              <NavigationItem
                label={t('nav.me')}
                icon={UserRound}
                active={false}
                aria-label={t('nav.me')}
                pictureUrl={pictureUrl}
              />
            )}
          />
        </Box>
      </Flex>
    </>
  );
}

interface NavigationItemProps {
  to?: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  'aria-label'?: string;
  pictureUrl?: string | null;
}

function NavigationItem({
  to,
  label,
  icon: NavIcon,
  active,
  pictureUrl,
  ...props
}: NavigationItemProps) {
  const content = (
    <>
      {pictureUrl ? (
        <Avatar.Root size="2xs" colorPalette="teal">
          <Avatar.Image src={pictureUrl} alt="" />
          <Avatar.Fallback>
            <NavIcon size={NAV_ICON_SIZE} />
          </Avatar.Fallback>
        </Avatar.Root>
      ) : (
        <NavIcon size={NAV_ICON_SIZE} />
      )}
      <Text fontSize={{ base: 'xs', md: 'sm' }}>{label}</Text>
    </>
  );
  const itemProps = {
    ...props,
    'aria-current': active ? ('page' as const) : undefined,
    display: 'flex',
    flex: { base: 1, md: 'none' },
    flexDirection: { base: 'column', md: 'row' } as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: { base: 0.5, md: 2 },
    h: 'auto',
    w: { base: 'full', md: 'auto' },
    minW: { base: 0, md: '7rem' },
    px: { base: 2, md: 4 },
    py: { base: 0, md: 2 },
    borderRadius: { base: 'lg', md: 'none' },
    borderBottomWidth: { base: 0, md: '2px' },
    borderColor: active ? 'fg.primary' : 'transparent',
    color: active ? 'fg.primary' : 'fg.navigation',
    fontWeight: 'medium',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    _hover: { color: 'fg', bg: 'bg.mutedCard' },
  } as const;

  if (to) {
    return (
      <ChakraLink asChild {...itemProps}>
        <RouterLink to={to}>{content}</RouterLink>
      </ChakraLink>
    );
  }

  return (
    <Button type="button" variant="plain" {...itemProps}>
      {content}
    </Button>
  );
}
