import { Avatar, Box, Button, type ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import UserIcon from '../../../assets/icons/user.svg?react';

type Props = Omit<ButtonProps, 'aria-label'>;

export const ProfileTriggerButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { t } = useTranslation();

  return (
    <Button
      ref={ref}
      variant="ghost"
      p={0}
      minW="auto"
      {...props}
      aria-label={t('nav.openProfileAria')}
    >
      <Avatar.Root size="sm" colorPalette="teal">
        <Avatar.Fallback>
          <Box
            boxSize="full"
            p="2px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.600"
            _dark={{ color: 'gray.200' }}
          >
            <UserIcon width="100%" height="100%" />
          </Box>
        </Avatar.Fallback>
      </Avatar.Root>
    </Button>
  );
});

ProfileTriggerButton.displayName = 'ProfileTriggerButton';
