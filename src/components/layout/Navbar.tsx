import { Box, Flex, Heading, Image, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfilePopover } from '../navbar/profile/ProfilePopover.tsx';

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="border.divider">
      <Flex w="full" mx="auto" py={2} px={4} align="center" justify="space-between">
        <Link
          href={import.meta.env.BASE_URL}
          display="inline-flex"
          alignItems="center"
          gap={2}
          _hover={{ textDecoration: 'underline' }}
          onClick={(e) => {
            e.preventDefault();
            void navigate('/');
          }}
        >
          <Image
            src={`${import.meta.env.BASE_URL}header.png`}
            alt=""
            boxSize="2.2rem"
            objectFit="contain"
          />
          <Heading fontSize="xl">{t('app.name')}</Heading>
        </Link>

        <ProfilePopover />
      </Flex>
    </Box>
  );
}
