import { Box, Flex, Heading, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfilePopover } from '../navbar/profile/ProfilePopover.tsx';

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box as="header" borderBottomWidth="1px">
      <Flex maxW="container.md" mx="auto" py={2} px={4} align="center" justify="space-between">
        <Link
          href="/"
          _hover={{ textDecoration: 'underline' }}
          onClick={(e) => {
            e.preventDefault();
            void navigate('/');
          }}
        >
          <Heading size="md">{t('app.name')}</Heading>
        </Link>

        <ProfilePopover />
      </Flex>
    </Box>
  );
}
