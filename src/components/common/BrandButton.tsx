import { Button, type ButtonProps, HStack, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const defaultHover = { filter: 'brightness(0.9)' };
const defaultActive = { filter: 'brightness(0.9)' };

export function PrimaryButton({ bg, color, _hover, _active, ...rest }: ButtonProps) {
  return (
    <Button
      bg={bg ?? 'fg.primary'}
      color={color ?? 'fg'}
      borderRadius="xl"
      _hover={_hover ?? defaultHover}
      _active={_active ?? defaultActive}
      {...rest}
    />
  );
}

export function AccentButton({ bg, color, _hover, _active, ...rest }: ButtonProps) {
  return (
    <Button
      bg={bg ?? 'fg.accent'}
      color={color ?? 'fg'}
      borderRadius="xl"
      _hover={_hover ?? defaultHover}
      _active={_active ?? defaultActive}
      {...rest}
    />
  );
}

export function GoogleLoginButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const googleLogoPath = `${import.meta.env.BASE_URL}google-logo.svg`;

  return (
    <Button
      onClick={onClick}
      variant="outline"
      bg="white"
      color="gray.700"
      borderColor="gray.400"
      _hover={{ bg: 'gray.300' }}
      _active={{ bg: 'gray.300' }}
      h="40px"
      w="auto"
      px="12px"
      borderRadius="20px"
      fontWeight="500"
      maxW="400px"
    >
      <HStack gap="10px">
        <Image src={googleLogoPath} alt="Google" boxSize="20px" />
        <Text fontWeight="semibold">{t('profile.loginWithGoogle')}</Text>
      </HStack>
    </Button>
  );
}
