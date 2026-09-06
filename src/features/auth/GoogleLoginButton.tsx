import { Button, HStack, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function GoogleLoginButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

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
        <Image src={`${import.meta.env.BASE_URL}google-logo.svg`} alt="Google" boxSize="20px" />
        <Text fontWeight="semibold">{t('profile.loginWithGoogle')}</Text>
      </HStack>
    </Button>
  );
}
